import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const InputSchema = z.object({
  symptom: z.enum(["irritation", "allergy", "burn", "barrier", "acne_flare", "redness", "other"]),
  description: z.string().min(2).max(800),
  currentProducts: z.array(z.string().max(120)).max(15).optional(),
  pregnant: z.boolean().optional(),
  lang: z.enum(["en", "ar"]).default("ar"),
});

function build(body: z.infer<typeof InputSchema>) {
  const langInstr =
    body.lang === "ar"
      ? "All textual fields MUST be in Egyptian Arabic — calm, reassuring, clear."
      : "All textual fields MUST be in English — calm, reassuring, clear.";

  return `You are SOSKIN SOS — Emergency Skin Mode. The user is panicking. Be calm, structured, and dermatologist-inspired.
Reported:
- Symptom type: ${body.symptom}
- Description: ${body.description}
- Currently using: ${body.currentProducts?.join(", ") || "(unknown)"}
- Pregnant: ${body.pregnant ? "yes — restrict actives accordingly" : "no"}

Return ONLY valid JSON (no markdown) with this exact schema:
{
  "severity": "mild" | "moderate" | "severe",
  "seeDoctor": boolean,
  "reassurance": string,
  "stopUsing": string[],
  "emergencySteps": [{ "step": number, "action": string }],
  "safeProducts": [{ "name": string, "brand": string, "why": string, "priceEGP": string, "image": string? }],
  "avoidActives": string[],
  "whenBetter": string
}

Rules:
- Answer urgently and concisely: short direct recommendations, clear rescue steps, and minimal explanation.
- Products MUST be the MOST POPULAR and widely-recognized in the Egyptian market (CeraVe, La Roche-Posay, Bioderma, Eucerin, Vichy, Avene, The Ordinary, Cetaphil, Neutrogena, Eva, Beesline, Sebamed).
- ${langInstr}
Output ONLY the JSON object.`;
}

export const Route = createFileRoute("/api/public/sos")({
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
            model: "gemini-2.5-pro",
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: build(body) }],
          }),
        });

        if (!upstream.ok) {
          const errText = await upstream.text().catch(() => "");
          console.error("[sos] upstream error", upstream.status, errText);
          return Response.json({ error: "SOS failed" }, { status: upstream.status });
        }

        const data = await upstream.json();
        const content = data?.choices?.[0]?.message?.content;
        if (!content) {
          return Response.json({ error: "Empty SOS response" }, { status: 502 });
        }
        try {
          const parsed = typeof content === "string" ? JSON.parse(content) : content;
          return Response.json(parsed);
        } catch {
          return Response.json({ error: "Bad SOS JSON" }, { status: 502 });
        }
      },
    },
  },
});
