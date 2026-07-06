import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const InputSchema = z.object({
  productText: z.string().min(5).max(8000),
  lang: z.enum(["en", "ar"]).default("ar"),
  skinType: z.string().max(50).optional(),
  concerns: z.array(z.string().max(50)).max(10).optional(),
  pregnant: z.boolean().optional(),
  allergies: z.string().max(200).optional(),
});

function prompt(b: z.infer<typeof InputSchema>) {
  const lang = b.lang === "ar" ? "Egyptian Arabic" : "English";
  return `You are SoSkin Compatibility Engine. Given a product analysis + user profile, return ONLY JSON:
{
  "score": number,             // 0-100 compatibility with this user
  "verdict": "perfect" | "good" | "caution" | "avoid",
  "pros": string[],            // 2-3 short bullets — why it fits
  "cons": string[],            // 1-3 short bullets — risks for THIS user
  "tip": string                // 1 short usage tip tailored to user
}

User profile:
- Skin type: ${b.skinType || "(unknown)"}
- Concerns: ${b.concerns?.join(", ") || "(none)"}
- Pregnant: ${b.pregnant ? "YES — flag retinoids, salicylic >2%, hydroquinone as avoid" : "no"}
- Allergies: ${b.allergies || "(none)"}

Product analysis:
${b.productText}

Rules:
- All text fields in ${lang}.
- Be honest. If product is wrong for this user, give a low score and say so.
Output ONLY the JSON.`;
}

export const Route = createFileRoute("/api/public/compat")({
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
          let msg = "Compatibility check failed";
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
