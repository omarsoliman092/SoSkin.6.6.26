import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const InputSchema = z.object({
  products: z.array(z.string().min(1).max(200)).min(2).max(20),
  lang: z.enum(["en", "ar"]).default("ar"),
  skinType: z.string().max(50).optional(),
  pregnant: z.boolean().optional(),
});

function systemPrompt(lang: "en" | "ar", skinType?: string, pregnant?: boolean) {
  const ctx = [
    skinType && `User skin type: ${skinType}.`,
    pregnant && "User is PREGNANT — flag retinoids, salicylic >2%, hydroquinone, high-dose vitamin A as HIGH severity.",
  ].filter(Boolean).join(" ");

  if (lang === "ar") {
    return `أنت خبير كيمياء تجميل. حلّل قائمة المنتجات للمستخدم وحدد تعارضات المكوّنات الفعالة بينها (مثلاً Retinol + AHA/BHA، Vitamin C + Niacinamide في نفس الوقت، Benzoyl Peroxide + Retinol).
${ctx}
أعد JSON فقط بالشكل:
{
  "summary": "ملخص قصير بالعربي",
  "conflicts": [
    { "between": ["اسم المنتج A", "اسم المنتج B"], "ingredient": "المكوّن المسبب", "severity": "low|medium|high", "reason": "السبب", "fix": "الحل (مثلاً استخدمهم في أوقات مختلفة)" }
  ],
  "safeCombos": [ { "products": ["A","B"], "note": "ليه آمن" } ],
  "schedule": { "AM": ["منتج 1","منتج 2"], "PM": ["منتج 3"], "notes": "ملاحظات الترتيب" }
}`;
  }
  return `You are a cosmetic chemistry expert. Analyze the user's product list and detect active-ingredient conflicts (e.g. Retinol + AHA/BHA, Vit C + Niacinamide same time, BPO + Retinol).
${ctx}
Return JSON only:
{
  "summary": "short overall summary",
  "conflicts": [
    { "between": ["Product A","Product B"], "ingredient": "trigger ingredient", "severity": "low|medium|high", "reason": "why", "fix": "how to resolve" }
  ],
  "safeCombos": [ { "products": ["A","B"], "note": "why safe" } ],
  "schedule": { "AM": ["..."], "PM": ["..."], "notes": "ordering notes" }
}`;
}

export const Route = createFileRoute("/api/public/conflicts")({
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

        const system = systemPrompt(body.lang, body.skinType, body.pregnant);
        const userText =
          (body.lang === "ar" ? "المنتجات:\n" : "Products:\n") +
          body.products.map((p, i) => `${i + 1}. ${p}`).join("\n");

        const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gemini-2.5-flash",
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: system },
              { role: "user", content: userText },
            ],
          }),
        });

        if (!upstream.ok) {
          let msg = "Conflict analysis failed";
          if (upstream.status === 429) msg = "Rate limit — try again shortly.";
          else if (upstream.status === 402) msg = "AI credits exhausted.";
          return Response.json({ error: msg }, { status: upstream.status });
        }

        const data = await upstream.json();
        const raw: string = data?.choices?.[0]?.message?.content ?? "";
        try {
          const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
          return Response.json(JSON.parse(cleaned));
        } catch {
          return Response.json({ error: "Bad AI response", raw }, { status: 502 });
        }
      },
    },
  },
});
