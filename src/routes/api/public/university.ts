import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const InputSchema = z.object({
  lang: z.enum(["en", "ar"]).default("ar"),
  ingredient: z.string().min(1).max(80),
});

function prompt(b: z.infer<typeof InputSchema>) {
  const lang = b.lang === "ar" ? "Egyptian Arabic" : "English";
  return `You are SoSkin Ingredient University.
Explain the skincare ingredient: "${b.ingredient}".

Return ONLY JSON:
{
  "name": string,
  "shortDef": string,           // 1 sentence, simple
  "bestFor": string[],          // skin types / concerns (max 4)
  "avoidIf": string[],          // max 3
  "pairsWith": string[],        // ingredients that play well (max 4)
  "conflictsWith": string[],    // ingredients that clash (max 4)
  "myth": string,               // common myth about it
  "truth": string,              // the truth
  "egyptianTip": string         // local context tip (humidity/sun/etc)
}
All text in ${lang}. JSON only.`;
}

export const Route = createFileRoute("/api/public/university")({
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
          let msg = "Lookup failed";
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
