import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const ProfileSchema = z.object({
  name: z.string().max(100).optional(),
  gender: z.enum(["male", "female"]).optional(),
  recommendFor: z.enum(["male", "female"]).optional(),
  skinType: z.string().max(50).optional(),
  combinationZone: z.string().max(20).optional(),
  concerns: z.array(z.string().max(50)).max(10).optional(),
  budget: z.string().max(50).optional(),
  preference: z.string().max(20).optional(),
  allergies: z.string().max(300).optional(),
  pregnant: z.boolean().optional(),
  favoriteBrands: z.string().max(200).optional(),
});

const InputSchema = z
  .object({
    image: z.string().min(20).max(15_000_000).optional(),
    productName: z.string().min(2).max(200).optional(),
    currentRoutine: z.array(z.string().max(120)).max(20).optional(),
    profile: ProfileSchema,
    lang: z.enum(["en", "ar"]).default("ar"),
  })
  .refine((d) => !!d.image || !!d.productName, {
    message: "image or productName required",
  });

function buildSystem(lang: "en" | "ar", profile: z.infer<typeof ProfileSchema>, routine?: string[]) {
  const profileLines = [
    profile.gender && `Gender: ${profile.gender}`,
    profile.recommendFor && `Recommending for: ${profile.recommendFor}`,
    profile.skinType && `Skin type: ${profile.skinType}${profile.combinationZone ? ` (${profile.combinationZone})` : ""}`,
    profile.concerns?.length && `Concerns: ${profile.concerns.join(", ")}`,
    profile.budget && `Budget: ${profile.budget}`,
    profile.preference && `Brand preference: ${profile.preference}`,
    profile.allergies && `Allergies: ${profile.allergies}`,
    profile.pregnant ? "PREGNANT — avoid retinoids, salicylic >2%, hydroquinone" : "",
    profile.favoriteBrands && `Favorite brands: ${profile.favoriteBrands}`,
  ]
    .filter(Boolean)
    .join("\n");

  const routineLines = routine && routine.length > 0
    ? `\n\nCURRENT ROUTINE / OTHER PRODUCTS USER USES:\n- ${routine.join("\n- ")}`
    : "";

  const langInstr =
    lang === "ar"
      ? "All textual fields in the JSON must be in Arabic (Egyptian-friendly tone)."
      : "All textual fields in the JSON must be in English.";

  return `You are SoSkin "Before You Buy" — a strict, honest skincare purchase advisor for an Egyptian audience.
Decide whether the given product is a good purchase for THIS specific user, based on their profile and current routine.

USER PROFILE:
${profileLines || "(no profile data)"}${routineLines}

You MUST respond with ONLY a valid JSON object (no markdown, no commentary, no code fences) with this exact schema:
{
  "productName": string,
  "verdict": "suitable" | "caution" | "not_suitable",
  "matchScore": number,            // 0-100, how well it matches the user
  "summary": string,                // 1-2 short sentences, plain language
  "reasons": string[],              // 2-5 bullets explaining WHY this verdict for THIS user
  "ingredientConflicts": [          // ingredient conflicts with the user's current routine or pregnancy/allergies
    { "ingredient": string, "conflictsWith": string, "severity": "low"|"medium"|"high", "note": string }
  ],
  "alternatives": [                 // 2-3 better options for THIS user; Egyptian/pharmacy-first when preference allows
    { "name": string, "brand": string, "whyBetter": string, "priceEGP": string }
  ],
  "estimatedSavingsEGP": string,    // e.g. "~200 EGP/month" or "" if N/A
  "buyDecision": string             // ONE short Arabic/English sentence: "اشتري" / "متشتريش" / "اشتري بحذر" etc.
}

Rules:
- Be honest. If the product isn't right for the user, say "not_suitable" — do not be polite to the point of being misleading.
- Flag pregnancy-unsafe actives as HIGH severity conflicts when the user is pregnant.
- Flag allergy matches as HIGH severity.
- Flag retinol + AHA/BHA, vitamin C + retinol PM, benzoyl peroxide + retinol overlaps in current routine as medium/high.
- ALTERNATIVES MUST be products actually available in the EGYPTIAN MARKET — Egyptian local brands (Eva, Isis Pharma, Bioderma-EG, etc.), Korean brands sold in Egypt (COSRX, Beauty of Joseon, Some By Mi, Anua, Skin1004 — available on Joybuy/Cocopanda/Sigma Beauty EG/pharmacies), French pharmacy brands (La Roche-Posay, Vichy, Avene, CeraVe — widely stocked in Egyptian pharmacies), or imported brands available on common Egyptian retailers. Do NOT recommend products that aren't realistically obtainable in Egypt. Use realistic Egyptian EGP pricing.
- Prefer alternatives matching the user's budget and brand preference.
- ${langInstr}
- Output ONLY the JSON. No extra text.`;
}

export const Route = createFileRoute("/api/public/decide")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return Response.json({ error: "AI not configured" }, { status: 500 });
        }

        let body: z.infer<typeof InputSchema>;
        try {
          body = InputSchema.parse(await request.json());
        } catch (e: any) {
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }

        const system = buildSystem(body.lang, body.profile, body.currentRoutine);

        const userContent: any[] = [];
        if (body.productName) {
          userContent.push({
            type: "text",
            text: `Product to evaluate: "${body.productName}". Use your knowledge of this product's ingredients and positioning.`,
          });
        }
        if (body.image) {
          const imageUrl = body.image.startsWith("data:")
            ? body.image
            : `data:image/jpeg;base64,${body.image}`;
          userContent.push({
            type: "text",
            text: "Read the product on the attached image (name, brand, ingredients, claims) and evaluate it for this user.",
          });
          userContent.push({ type: "image_url", image_url: { url: imageUrl } });
        }

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-pro",
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: system },
              { role: "user", content: userContent },
            ],
          }),
        });

        if (!upstream.ok) {
          const errText = await upstream.text().catch(() => "");
          console.error("decide AI error", upstream.status, errText);
          let msg = "Decision failed";
          if (upstream.status === 429) msg = "Rate limit exceeded — try again shortly.";
          else if (upstream.status === 402)
            msg = "AI credits exhausted. Please add credits to your workspace.";
          return Response.json({ error: msg }, { status: upstream.status });
        }

        const data = await upstream.json();
        const raw: string = data?.choices?.[0]?.message?.content ?? "";
        let parsed: unknown;
        try {
          // Strip code fences if any sneak through
          const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
          parsed = JSON.parse(cleaned);
        } catch {
          return Response.json({ error: "Bad AI response", raw }, { status: 502 });
        }

        return Response.json(parsed);
      },
    },
  },
});
