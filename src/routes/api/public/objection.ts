import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const InputSchema = z.object({
  lang: z.enum(["en", "ar"]).default("ar"),
  objection: z.string().min(1).max(300),
  context: z.string().max(300).optional(),
});

function prompt(b: z.infer<typeof InputSchema>) {
  const lang = b.lang === "ar" ? "Egyptian Arabic" : "English";
  return `You are SoSkin's elite in-store sales coach. Counter this customer objection.

Objection: "${b.objection}"
Context: ${b.context || "(walk-in beauty store customer)"}

Return ONLY JSON:
{
  "reframe": string,            // 1-line reframe of the objection
  "scripts": string[],          // 3 ready-to-say responses, conversational
  "proofPoint": string,         // 1 hard fact / value calculation to close
  "fallback": string            // last-resort cheaper alternative pitch
}
All in ${lang}. JSON only.`;
}

export const Route = createFileRoute("/api/public/objection")({
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
            model: "gemini-2.5-flash",
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
