import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const InputSchema = z.object({
  lang: z.enum(["en", "ar"]).default("ar"),
  customer: z.object({
    name: z.string().max(80).optional(),
    ageRange: z.string().max(20).optional(),
    skinType: z.string().max(40).optional(),
    concerns: z.array(z.string().max(40)).max(8).optional(),
    lastProducts: z.array(z.string().max(200)).max(15).optional(),
    notes: z.string().max(500).optional(),
  }),
});

function prompt(b: z.infer<typeof InputSchema>) {
  const lang = b.lang === "ar" ? "Egyptian Arabic" : "English";
  const c = b.customer;
  return `You are SoSkin's in-store Cross-Sell Coach for a beauty advisor.
Customer profile:
- Name: ${c.name || "(walk-in)"}
- Age range: ${c.ageRange || "(unknown)"}
- Skin type: ${c.skinType || "(unknown)"}
- Concerns: ${c.concerns?.join(", ") || "(none)"}
- Already bought / using: ${c.lastProducts?.join(", ") || "(nothing logged)"}
- Notes: ${c.notes || "(none)"}

Suggest the NEXT BEST PRODUCT to add to this customer's routine — must be:
- COMPLEMENTARY to what they already have (fill a gap, not duplicate).
- MOST POPULAR and widely-recognized in Egyptian pharmacies/retail (CeraVe, La Roche-Posay, Bioderma, Eucerin, Vichy, Avene, The Ordinary, Cetaphil, Neutrogena, Eva, Beesline).
- Realistically priced in EGP.
- Higher-margin where possible without sacrificing fit.

Return ONLY JSON:
{
  "primary": {
    "product": string,
    "brand": string,
    "category": string,
    "priceEGP": string,
    "whyNow": string,                  // 1 sentence pitch for the floor
    "pairsWith": string[],             // 1-2 of their existing products
    "objectionCounter": string         // pre-baked answer to "it's expensive"
  },
  "alternatives": [
    { "product": string, "brand": string, "priceEGP": string, "tradeoff": string }
  ],
  "scriptOpener": string               // 1-line conversation starter in ${lang}
}

All text fields in ${lang}. Output ONLY the JSON.`;
}

export const Route = createFileRoute("/api/public/next-best")({
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
            model: "gemini-2.5-flash-lite",
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: prompt(body) }],
          }),
        });

        if (!upstream.ok) {
          let msg = "Suggestion failed";
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
