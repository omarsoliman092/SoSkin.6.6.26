import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const InputSchema = z.object({
  // Back-compat: single image
  imageDataUrl: z.string().min(50).max(8_000_000).optional(),
  // New: multi-angle capture (front, left, right, etc.)
  imageDataUrls: z.array(z.string().min(50).max(8_000_000)).min(1).max(5).optional(),
  lang: z.enum(["en", "ar"]).default("ar"),
}).refine((v) => v.imageDataUrl || (v.imageDataUrls && v.imageDataUrls.length > 0), {
  message: "At least one image is required",
});

export const Route = createFileRoute("/api/public/skin-detect")({
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

        const images = body.imageDataUrls && body.imageDataUrls.length > 0
          ? body.imageDataUrls
          : [body.imageDataUrl!];
        const multi = images.length > 1;

        const lang = body.lang === "ar" ? "Arabic" : "English";
        const angleLabels = ["FRONT (facing camera)", "LEFT cheek profile", "RIGHT cheek profile", "FOREHEAD close-up", "CHIN close-up"];
        const prompt = `You are a clinical-grade dermatology vision model used in a professional skin-diagnostic kiosk (similar to La Roche-Posay Effaclar Spotscan and Vichy SkinConsult AI).

${multi
  ? `You will receive ${images.length} photos of the SAME person taken from different angles: ${images.map((_, i) => angleLabels[i] || `angle ${i + 1}`).join(", ")}. Cross-reference all angles to produce a single confident verdict. Use side angles to evaluate pores, oiliness on cheeks, jawline acne, and texture; use the front angle for T-zone, redness distribution, and overall tone.`
  : "You will receive ONE selfie. Do your best with limited angles."}

Evaluate these clinical signals: sebum / shine on T-zone and cheeks, visible pore size and distribution, dryness or flaking patches, redness/erythema and sensitivity, hydration level, texture irregularity, post-inflammatory marks, blackheads, fine lines, and uneven tone.

Return ONLY valid JSON (no markdown):
{
  "skinType": "Oily" | "Dry" | "Combination" | "Normal" | "Sensitive",
  "combinationZone": "tzone" | "ozone" | "uzone" | "",
  "confidence": number,                  // 0-100 — raise this when multiple angles agree
  "anglesUsed": number,                  // number of distinct usable angles received
  "scores": {                            // 0-100 severity for each signal
    "oiliness": number,
    "dryness": number,
    "redness": number,
    "pores": number,
    "texture": number,
    "hydration": number,                 // 0=dehydrated, 100=well-hydrated
    "darkSpots": number,
    "wrinkles": number
  },
  "observations": string[],              // 3-6 short bullets in ${lang}, reference angles when relevant
  "concerns": string[],                  // from this list ONLY: Acne, Dark spots, Wrinkles, Redness, Dehydration, Blackheads, Dullness, Sun damage
  "summary": string                      // 1-2 sentence verdict in ${lang}, professional tone
}

Rules:
- If NO image contains a clear face, set skinType "" and explain in summary (in ${lang}).
- combinationZone is "" unless skinType is "Combination".
- Be decisive and clinical. Never refuse. Lower confidence instead of skipping fields.`;

        const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
          { type: "text", text: prompt },
          ...images.map((url) => ({ type: "image_url", image_url: { url } })),
        ];

        const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gemini-2.5-flash-lite",
            response_format: { type: "json_object" },
            messages: [{ role: "user", content }],
          }),
        });

        if (!upstream.ok) {
          let msg = "Detection failed";
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
