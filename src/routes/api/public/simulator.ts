import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["customer", "advisor"]),
  content: z.string().max(2000),
});

const InputSchema = z.object({
  scenario: z.enum(["too_expensive", "will_it_work", "saw_cheaper", "why_this", "need_serum", "free_play"]),
  messages: z.array(MessageSchema).max(30),
  lang: z.enum(["en", "ar"]).default("ar"),
  mode: z.enum(["reply", "evaluate"]).default("reply"),
});

const SCENARIOS = {
  too_expensive: "This product is too expensive. Why should I pay this much?",
  will_it_work: "Will this actually help me? I've tried so many things.",
  saw_cheaper: "I saw something cheaper at another pharmacy that looks similar.",
  why_this: "Why are you recommending THIS product specifically and not another one?",
  need_serum: "Do I really need a serum? Isn't moisturizer enough?",
  free_play: "(open scenario — be a realistic skeptical Egyptian customer)",
} as const;

function buildSystem(body: z.infer<typeof InputSchema>) {
  const langInstr =
    body.lang === "ar" ? "Respond in Egyptian Arabic." : "Respond in English.";

  if (body.mode === "evaluate") {
    return `You are SoSkin's sales-coach evaluator. Analyze the advisor's responses in this practice session.

SCENARIO: ${SCENARIOS[body.scenario]}

Return ONLY valid JSON (no markdown) with this schema:
{
  "scores": {
    "persuasion": number,        // 0-100
    "professionalism": number,   // 0-100
    "sellingLogic": number,      // 0-100
    "customerHandling": number   // 0-100
  },
  "overall": number,             // 0-100
  "strengths": string[],         // 2-3 short bullets
  "improvements": string[],      // 2-3 short bullets
  "modelAnswer": string          // a 2-4 sentence ideal advisor reply for the LAST customer message
}

${langInstr}
Output ONLY the JSON object.`;
  }

  return `You are a realistic, slightly skeptical Egyptian pharmacy customer talking to a beauty advisor.
SCENARIO: ${SCENARIOS[body.scenario]}

RULES:
- Stay in character as the CUSTOMER. Never break character. Never coach.
- Push back naturally on weak answers; ease up on strong professional answers.
- Reference prices in EGP. Be conversational, not robotic. 1-3 short sentences per turn.
- If the advisor handled an objection well, evolve to a new related concern.
- ${langInstr}
Respond ONLY with your next customer message (plain text, no quotes, no labels).`;
}

export const Route = createFileRoute("/api/public/simulator")({
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

        const system = buildSystem(body);

        // Map roles: customer = assistant (the AI plays the customer), advisor = user (the human advisor)
        const mapped = body.messages.map((m) => ({
          role: m.role === "customer" ? "assistant" : "user",
          content: m.content,
        }));

        const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gemini-2.5-flash-lite",
            ...(body.mode === "evaluate" ? { response_format: { type: "json_object" } } : {}),
            messages: [{ role: "system", content: system }, ...mapped],
          }),
        });

        if (!upstream.ok) {
          let msg = "Simulator failed";
          if (upstream.status === 429) msg = "Rate limit exceeded.";
          else if (upstream.status === 402) msg = "AI credits exhausted.";
          return Response.json({ error: msg }, { status: upstream.status });
        }

        const data = await upstream.json();
        const raw: string = data?.choices?.[0]?.message?.content ?? "";

        if (body.mode === "evaluate") {
          try {
            const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
            return Response.json(JSON.parse(cleaned));
          } catch {
            return Response.json({ error: "Bad AI response" }, { status: 502 });
          }
        }

        return Response.json({ reply: raw.trim() });
      },
    },
  },
});
