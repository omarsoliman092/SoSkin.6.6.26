import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { callAI } from "@/lib/ai-handler.server";

const InputSchema = z.object({
  image: z.string().min(20).max(15_000_000), // data URL base64
  lang: z.enum(["en", "ar"]).default("ar"),
});

function buildPrompt(lang: "en" | "ar") {
  if (lang === "ar") {
    return `أنت خبير تحليل منتجات العناية بالبشرة وعندك معرفة عميقة بكل المنتجات الموجودة فى السوق المصرى (كورى، فرنسى، أمريكى، مصرى محلى، مستورد عبر الصيدليات).
حلل صورة المنتج المرفقة، اقرأ الاسم والماركة والمكونات على العبوة، واستخدم معرفتك الواسعة بهذا المنتج تحديداً.

⚠️ قواعد إلزامية:
- ممنوع تقول "لم أتمكن من التعرف" أو "غير معروف" — لازم تبحث فى معرفتك بعمق وتطلع بإجابة كاملة. لو الصورة فيها أى تلميح للماركة أو نوع المنتج، اعتمد عليه.
- "طريقة الاستخدام" لازم تكتبها دايماً حتى لو مش مكتوبة على العبوة. استخدم معرفتك بنوع المنتج (تونر/سيروم/كريم/غسول/واقى شمس) لكتابة الطريقة الصحيحة طبياً.
- الفوائد والمواد الفعالة كذلك — لو مش واضحة على العبوة استنتجها من اسم المنتج وفئته ومعرفتك بالتركيبة الفعلية.

أعد الإجابة بالعربية بالصيغة التالية حرفياً بدون أى مقدمات:

📌 إسم المنتج: <الاسم الكامل + الماركة>
✨ فوائد المنتج:
- <فائدة 1>
- <فائدة 2>
- <فائدة 3>
🧪 المواد الفعالة:
- <مادة 1 + التركيز إن أمكن>
- <مادة 2>
- <مادة 3>
💡 طريقة الإستخدام:
- <خطوة 1 — صباحاً/مساءً، قبل/بعد إيه>
- <خطوة 2>
- <خطوة 3 إن لزم>

لو الصورة فعلاً مش لمنتج عناية بالبشرة (مثلاً أكل أو حاجة تانية خالص) قول ذلك صراحة.`;
  }
  return `You are a skincare product expert with deep knowledge of every product sold in the Egyptian market (Korean, French, American, local Egyptian, pharmacy imports).
Analyze the attached image, read the name/brand/ingredients on the packaging, and use your deep knowledge of this specific product.

⚠️ MANDATORY RULES:
- NEVER say "couldn't identify" or "Unknown". Search your knowledge deeply and return a complete answer. If the image shows even a hint of brand or product type, use it.
- "How to Use" MUST always be filled in, even if not printed on the packaging. Use your knowledge of the product category (toner/serum/cream/cleanser/sunscreen) to write the correct dermatological usage.
- Benefits and Active Ingredients similarly — if not visible on the packaging, infer from the product name, category, and your knowledge of its actual formulation.

Reply in English in EXACTLY this format with no preamble:

📌 Product Name: <full name + brand>
✨ Benefits:
- <benefit 1>
- <benefit 2>
- <benefit 3>
🧪 Active Ingredients:
- <ingredient 1 + % if known>
- <ingredient 2>
- <ingredient 3>
💡 How to Use:
- <step 1 — AM/PM, before/after what>
- <step 2>
- <step 3 if needed>

Only if the image is genuinely not a skincare product (e.g. food, unrelated item), say so explicitly.`;
}

export const Route = createFileRoute("/api/public/analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof InputSchema>;
        try {
          body = InputSchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }

        const imageUrl = body.image.startsWith("data:")
          ? body.image
          : `data:image/jpeg;base64,${body.image}`;

        try {
          const text = await callAI({
            model: "gemini-2.5-pro", // This will be mapped to gpt-4o for vision
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: buildPrompt(body.lang) },
                  { type: "image_url", image_url: { url: imageUrl } },
                ],
              },
            ],
          });
          return Response.json({ text });
        } catch (error: any) {
          console.error("Vision AI error", error);
          return Response.json({ error: error.message || "Analysis failed" }, { status: 500 });
        }
      },
    },
  },
});
