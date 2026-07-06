import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const InputSchema = z.object({
  lang: z.enum(["en", "ar"]).default("ar"),
});

function prompt(b: z.infer<typeof InputSchema>) {
  const lang = b.lang === "ar" ? "Egyptian Arabic" : "English";
  return `You are SoSkin's social trend analyst for Egyptian beauty stores.
List the TOP 6 currently viral TikTok/Instagram skincare or beauty trends RIGHT NOW.
For each, map to a HIGH-MARGIN product or category typically available on Egyptian beauty store shelves.

Return ONLY JSON:
{
  "trends": [
    {
      "trend": string,           // short trend name
      "platform": "TikTok" | "Instagram" | "Both",
      "whatItIs": string,        // 1 sentence
      "matchedProduct": string,  // product/category to sell
      "salesAngle": string,      // 1-line pitch to the customer
      "heat": "🔥" | "🔥🔥" | "🔥🔥🔥"
    }
  ]
}
All text in ${lang}. JSON only.`;
}

export const Route = createFileRoute("/api/public/trends")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return Response.json({ error: "AI not configured" }, { status: 500 });
        let body: z.infer<typeof InputSchema>;
        try { body = InputSchema.parse(await request.json()); }
        catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }

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
          let msg = "Failed";
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
