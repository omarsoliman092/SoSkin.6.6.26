import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const InputSchema = z.object({
  level: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  topic: z.string().max(80).optional(),
  lang: z.enum(["en", "ar"]).default("ar"),
});

export const Route = createFileRoute("/api/public/academy")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return Response.json({ error: "AI not configured" }, { status: 500 });
        let body: z.infer<typeof InputSchema>;
        try { body = InputSchema.parse(await request.json()); }
        catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }

        const lang = body.lang === "ar" ? "Egyptian Arabic." : "English.";
        const prompt = `You are SoSkin Beauty Academy — train pharmacy beauty advisors.
Generate ONE fresh quiz round at level: ${body.level}. Topic focus: ${body.topic || "(any: ingredients, objections, scenarios, K-beauty, claims)"}.

Return ONLY JSON:
{
  "title": string,
  "kind": "mcq" | "objection" | "scenario",
  "question": string,
  "options": string[],             // 4 options
  "correctIndex": number,          // 0-3
  "xp": number,                    // 10/20/30
  "explanation": string,           // why correct, short teaching
  "proTip": string                 // 1-line advisor takeaway
}
Rules:
- Each call returns a DIFFERENT question (use varied topics).
- Make scenarios realistic to Egyptian pharmacy.
- ${lang}
JSON only.`;

        const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gemini-2.5-flash",
            response_format: { type: "json_object" },
            temperature: 0.9,
            messages: [{ role: "user", content: prompt }],
          }),
        });
        if (!upstream.ok) {
          let msg = "Academy failed";
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
