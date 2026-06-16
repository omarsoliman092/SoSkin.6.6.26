import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const InputSchema = z.object({
  product: z.string().min(2).max(200),
  lang: z.enum(["en", "ar"]).default("ar"),
  budget: z.string().max(50).optional(),
  preference: z.string().max(20).optional(),
});

function prompt(b: z.infer<typeof InputSchema>) {
  const langInstr =
    b.lang === "ar"
      ? "All textual fields MUST be in Egyptian Arabic."
      : "All textual fields MUST be in English.";
  return `You are SoSkin Alternatives Finder for the Egyptian market. The user wants alternatives to: "${b.product}".
User budget: ${b.budget || "(any)"}; preference: ${b.preference || "both"}.

Rules:
- Suggest 4-6 alternatives that MATCH the same active ingredient/benefit category.
- PRIORITIZE the MOST POPULAR and well-known products in the Egyptian market (mainstream pharmacy chains like Seif, El Ezaby, 19011; Carrefour; Spinneys; popular brands Egyptian consumers actually recognize: CeraVe, La Roche-Posay, Bioderma, Eucerin, Vichy, Avene, Garnier, L'Oreal, Neutrogena, The Ordinary, Cetaphil, Nivea, Beesline, Sebamed, Eva, Bioxcin).
- Score similarity 0-100 (formula closeness, not marketing).
- Estimate Egyptian price in EGP (numeric range like "450-550 EGP").
- IMPORTANT: ORDER the "dupes" array from MOST EXPENSIVE to CHEAPEST.

Return ONLY valid JSON:
{
  "original": { "name": string, "estPriceEGP": string, "keyActives": string[] },
  "dupes": [
    { "name": string, "brand": string, "priceEGP": string, "similarity": number, "whyMatch": string, "tradeoff": string }
  ],
  "verdict": string
}
${langInstr}
Output ONLY the JSON object.`;
}

export const Route = createFileRoute("/api/public/dupes")({
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
            model: "gemini-2.5-pro",
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: prompt(body) }],
          }),
        });

        if (!upstream.ok) {
          let msg = "Dupe lookup failed";
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
