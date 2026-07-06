import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { googleSearch, type GoogleSearchItem } from "@/lib/google-search.server";

/**
 * Quick value-first analyzer (NO AUTH).
 * 1) Gemini Vision identifies the product + ingredient analysis.
 * 2) Google Custom Search returns price/pharmacy listings.
 *
 * NO external scrapers. Re-render safe (client caches results).
 */

const InputSchema = z.object({
  image: z.string().min(20).max(15_000_000),
  lang: z.enum(["en", "ar"]).default("ar"),
});

const PHARMACY_SITES = [
  { id: "caretobeauty", name: "Care To Beauty", site: "caretobeauty.com" },
  { id: "elezaby", name: "El Ezaby", site: "elezabypharmacy.com" },
  { id: "belbaa", name: "Belbaa", site: "belbaapharmacy.com" },
];

function buildPrompt(lang: "en" | "ar") {
  if (lang === "ar") {
    return `أنت خبير عناية بالبشرة. حلل صورة المنتج وأعد إجابة بالعربية بالصيغة التالية حرفياً:

📌 إسم المنتج: <الاسم + الماركة>
✨ فوائد المنتج:
- <فائدة 1>
- <فائدة 2>
- <فائدة 3>
🧪 المواد الفعالة:
- <مادة 1>
- <مادة 2>
- <مادة 3>
💡 طريقة الإستخدام:
- <خطوة 1>
- <خطوة 2>

ممنوع تقول "غير معروف". لو الصورة مش لمنتج عناية بالبشرة قول ذلك صراحة.`;
  }
  return `You are a skincare expert. Analyze the product image and reply in EXACTLY this format:

📌 Product Name: <name + brand>
✨ Benefits:
- <benefit 1>
- <benefit 2>
- <benefit 3>
🧪 Active Ingredients:
- <ing 1>
- <ing 2>
- <ing 3>
💡 How to Use:
- <step 1>
- <step 2>

Never say "Unknown". If the image is not a skincare product, say so explicitly.`;
}

function extractName(text: string): string | null {
  const m = text.match(/📌[^:]*:\s*(.+)/);
  return m?.[1]?.trim().slice(0, 140) || null;
}

export const Route = createFileRoute("/api/public/quick-analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          return Response.json({ error: "AI not configured" }, { status: 500 });
        }

        let body: z.infer<typeof InputSchema>;
        try {
          body = InputSchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }

        const imageUrl = body.image.startsWith("data:")
          ? body.image
          : `data:image/jpeg;base64,${body.image}`;

        // 1) Vision
        const upstream = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gemini-2.5-flash",
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: buildPrompt(body.lang) },
                    { type: "image_url", image_url: { url: imageUrl } },
                  ],
                },
              ],
            }),
          },
        );

        if (!upstream.ok) {
          const errText = await upstream.text().catch(() => "");
          console.error("quick-analyze vision", upstream.status, errText);
          let msg = "Analysis failed";
          if (upstream.status === 429) msg = "Rate limit — try again shortly.";
          else if (upstream.status === 402) msg = "AI credits exhausted.";
          return Response.json({ error: msg }, { status: upstream.status });
        }

        const data = await upstream.json();
        const text: string = data?.choices?.[0]?.message?.content ?? "";
        const productName = extractName(text);

        // 2) Google CSE — parallel across pharmacy sites
        let products: Array<{
          pharmacy: string;
          pharmacyId: string;
          url: string | null;
          price: string | null;
          image: string | null;
          title: string | null;
          snippet: string | null;
        }> = [];

        if (productName) {
          const tasks = PHARMACY_SITES.map(async (ph) => {
            const hits = await googleSearch(productName, {
              site: ph.site,
              num: 1,
            });
            const first: GoogleSearchItem | undefined = hits[0];
            return {
              pharmacy: ph.name,
              pharmacyId: ph.id,
              url: first?.link ?? null,
              price: first?.price ?? null,
              image: first?.image ?? null,
              title: first?.title ?? null,
              snippet: first?.snippet ?? null,
            };
          });
          products = await Promise.all(tasks);
        }

        return Response.json({ text, productName, products });
      },
    },
  },
});
