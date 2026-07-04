import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const ProductSchema = z.object({
  name: z.string().min(1).max(120),
  purchasedDaysAgo: z.number().int().min(0).max(365).optional(),
});

const InputSchema = z.object({
  customerName: z.string().max(80).optional(),
  products: z.array(ProductSchema).min(1).max(8),
  tone: z.enum(["friendly", "premium", "urgent"]).default("friendly"),
  lang: z.enum(["en", "ar"]).default("ar"),
});

export const Route = createFileRoute("/api/public/replenish")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return Response.json({ error: "AI not configured" }, { status: 500 });
        let body: z.infer<typeof InputSchema>;
        try { body = InputSchema.parse(await request.json()); }
        catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }

        const lang = body.lang === "ar" ? "Egyptian Arabic" : "English";
        const list = body.products
          .map((p) => `- ${p.name}${p.purchasedDaysAgo != null ? ` (bought ${p.purchasedDaysAgo} days ago)` : ""}`)
          .join("\n");

        const prompt = `You are SoSkin's VIP follow-up expert. Write a WhatsApp REPLENISHMENT message to a beauty pharmacy customer.

Customer name: ${body.customerName || "(none — keep generic)"}
Tone: ${body.tone}
Products previously bought:
${list}

Return ONLY JSON:
{
  "message": string,                 // ready-to-send WhatsApp text in ${lang}, 3-5 short lines, includes 1 emoji max, NO links, NO markdown
  "expectedRunoutDays": number,      // best estimate of when products run out (typical cycle)
  "reasoning": string,               // 1 short line for the advisor (in ${lang}) — why now
  "upsellSuggestion": string         // 1 product to upsell alongside refill, in ${lang}
}
Rules:
- Personalize to product type (cleanser ~60d, serum ~45d, sunscreen ~30-45d, cream ~60d).
- Don't be pushy. Use ${lang} naturally. JSON only.`;

        const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gemini-2.5-flash-lite",
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: prompt }],
          }),
        });
        if (!upstream.ok) {
          let msg = "Replenish failed";
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
