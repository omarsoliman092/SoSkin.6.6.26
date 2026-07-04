import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const InputSchema = z.object({
  before: z.string().min(20),  // data URL
  after: z.string().min(20),
  weeks: z.number().min(0).max(104).optional(),
  routine: z.string().max(500).optional(),
  lang: z.enum(["en", "ar"]).default("ar"),
});

export const Route = createFileRoute("/api/public/progress")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return Response.json({ error: "AI not configured" }, { status: 500 });
        let body: z.infer<typeof InputSchema>;
        try { body = InputSchema.parse(await request.json()); }
        catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }

        const lang = body.lang === "ar" ? "Egyptian Arabic." : "English.";
        const prompt = `You are SoSkin Progress Analyzer. Compare 2 selfies (BEFORE then AFTER).
Period: ${body.weeks ?? "?"} weeks. Routine context: ${body.routine || "(none)"}.

Return ONLY JSON:
{
  "overallImprovement": number,       // 0-100
  "metrics": {
    "acne": { "delta": number, "note": string },        // delta: -100..+100 (+ = improved)
    "redness": { "delta": number, "note": string },
    "hydration": { "delta": number, "note": string },
    "brightness": { "delta": number, "note": string },
    "texture": { "delta": number, "note": string },
    "pores": { "delta": number, "note": string }
  },
  "summary": string,
  "routineVerdict": string,           // is routine working?
  "nextSteps": string[]               // 3 bullets
}
Rules:
- Be honest. If photos are unclear, say so in summary and lower confidence.
- ${lang}
JSON only.`;

        const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gemini-2.5-flash-lite",
            response_format: { type: "json_object" },
            messages: [{
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: body.before } },
                { type: "image_url", image_url: { url: body.after } },
              ],
            }],
          }),
        });
        if (!upstream.ok) {
          let msg = "Analyze failed";
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
