import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const InputSchema = z.object({
  skinType: z.string().max(50).optional(),
  concerns: z.array(z.string().max(50)).max(8).optional(),
  budget: z.string().max(50).optional(),
  preference: z.string().max(20).optional(),
  sensitive: z.boolean().optional(),
  pregnant: z.boolean().optional(),
  gender: z.string().max(10).optional(),
  level: z.enum(["starter", "intermediate", "advanced"]).default("starter"),
  skinCycling: z.boolean().optional(),
  lang: z.enum(["en", "ar"]).default("ar"),
});

function build(body: z.infer<typeof InputSchema>) {
  const langInstr =
    body.lang === "ar"
      ? "All textual fields MUST be in Egyptian Arabic."
      : "All textual fields MUST be in English.";

  const stepLimit = body.level === "starter" ? 3 : body.level === "intermediate" ? 4 : 5;

  return `You are SoSkin's AI Routine Builder.
User profile:
- Gender: ${body.gender || "(unknown)"}
- Skin type: ${body.skinType || "(unknown)"}
- Concerns: ${body.concerns?.join(", ") || "(none)"}
- Budget: ${body.budget || "(any)"}
- Preference: ${body.preference || "both"}
- Sensitive: ${body.sensitive ? "yes" : "no"}
- Pregnant: ${body.pregnant ? "yes" : "no"}
- Experience level: ${body.level}
- Skin Cycling mode: ${body.skinCycling ? "ENABLED — design PM as a 4-night repeating cycle" : "disabled"}

PRINCIPLES:
- Start SIMPLE. Max ${stepLimit} steps per AM/PM routine. Do NOT overwhelm.
- Introduce actives gradually (frequency notes per step).
- All products MUST be available in the EGYPTIAN market (Egyptian local, K-beauty distributed in Egypt, French pharmacy stocked in EG, realistic imports).
- Pregnant: NO retinoids, NO salicylic >2%, NO hydroquinone.
- Sensitive: avoid high-strength AHAs, fragrance, denatured alcohol upfront.
${body.skinCycling ? `- SKIN CYCLING: PM rotates over 4 nights — Night 1: Exfoliation, Night 2: Retinoid (or alternative if pregnant/sensitive), Night 3 & 4: Recovery (hydration + barrier). Reflect this in "weekly" as 4 entries Night 1..Night 4.` : ""}

Return ONLY valid JSON (no markdown) with this exact schema:
{
  "summary": string,                     // 1-line philosophy of the routine
  "am": [{ "step": number, "type": string, "product": string, "brand": string, "priceEGP": string, "frequency": string, "why": string }],
  "pm": [{ "step": number, "type": string, "product": string, "brand": string, "priceEGP": string, "frequency": string, "why": string }],
  "weekly": [{ "day": string, "action": string }],
  "totalCostEGP": string,
  "introductionPlan": string[]
}

- ${langInstr}
Output ONLY the JSON object.`;
}

export const Route = createFileRoute("/api/public/builder")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return Response.json({ error: "AI not configured" }, { status: 500 });

        let body: z.infer<typeof InputSchema>;
        try {
          body = InputSchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }

        const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gemini-2.5-flash",
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: build(body) }],
          }),
        });

        if (!upstream.ok) {
          let msg = "Builder failed";
          if (upstream.status === 429) msg = "Rate limit exceeded.";
          else if (upstream.status === 402) msg = "AI credits exhausted.";
          return Response.json({ error: msg }, { status: upstream.status });
        }

        const data = await upstream.json();
        const raw: string = data?.choices?.[0]?.message?.content ?? "";
        try {
          const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
          return Response.json(JSON.parse(cleaned));
        } catch {
          return Response.json({ error: "Bad AI response" }, { status: 502 });
        }
      },
    },
  },
});
