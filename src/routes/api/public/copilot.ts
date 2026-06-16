import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const InputSchema = z.object({
  ageRange: z.enum(["teen", "20s", "30s", "40s", "50plus"]),
  mainIssue: z.enum([
    "acne",
    "dark_spots",
    "wrinkles",
    "dehydration",
    "redness",
    "dullness",
    "sun_damage",
    "hair_thinning",
  ]),
  budget: z.enum(["low", "mid", "high"]),
  lang: z.enum(["en", "ar"]).default("ar"),
});

function build(body: z.infer<typeof InputSchema>) {
  const langInstr =
    body.lang === "ar"
      ? "All textual fields MUST be in Egyptian Arabic — confident, persuasive, professional sales tone."
      : "All textual fields MUST be in English — confident, persuasive, professional sales tone.";

  return `You are SOSKIN Co-Pilot — an in-store sales enablement AI for a beauty advisor.
A customer is standing in front of the advisor RIGHT NOW. Build a 3-click Sales Attack Plan.

Customer profile:
- Age range: ${body.ageRange}
- Main issue: ${body.mainIssue}
- Budget: ${body.budget}

Return ONLY valid JSON (no markdown) with this exact schema:
{
  "diagnosis": string,
  "routine": [{ "step": number, "time": "AM" | "PM" | "Weekly", "category": string, "product": string, "brand": string, "priceEGP": string, "why": string }],
  "objections": [{ "objection": string, "counter": string }],
  "closingLine": string,
  "upsell": { "product": string, "brand": string, "why": string }
}

Rules:
- All products MUST be available in the Egyptian market (CeraVe, La Roche-Posay, The Ordinary, Eva, Bioderma, etc.)
- Budget low = total < 1000 EGP, mid = 1000-2500, high = 2500+
- 3-5 routine steps max, prioritize active ingredients matching the main issue
- 2-3 most common objections for this customer profile, with persuasive counters
- closingLine: ONE direct sentence that closes the sale
- ${langInstr}
Output ONLY the JSON object.`;
}

export const Route = createFileRoute("/api/public/copilot")({
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
            model: "gemini-2.5-flash",
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: build(body) }],
          }),
        });

        if (!upstream.ok) {
          if (upstream.status === 429)
            return Response.json({ error: "Rate limit. Try again in a moment." }, { status: 429 });
          if (upstream.status === 402)
            return Response.json({ error: "AI credits exhausted." }, { status: 402 });
          return Response.json({ error: "Co-Pilot failed" }, { status: upstream.status });
        }

        const data = await upstream.json();
        const content = data?.choices?.[0]?.message?.content;
        if (!content) return Response.json({ error: "Empty AI response" }, { status: 502 });

        try {
          return Response.json(JSON.parse(content));
        } catch {
          return Response.json({ error: "Invalid AI JSON" }, { status: 502 });
        }
      },
    },
  },
});
