import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { callAI } from "@/lib/ai-handler.server";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().max(8000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
  role: z.enum(["advisor", "expert", "customer"]),
  lang: z.enum(["en", "ar"]),
  answerStyle: z.enum(["quick", "detailed"]).optional(),
  profile: z.object({
    name: z.string().max(100).optional(),
    gender: z.enum(["male", "female"]).optional(),
    recommendFor: z.enum(["male", "female"]).optional(),
    skinType: z.string().max(50).optional(),
    combinationZone: z.string().max(20).optional(),
    concerns: z.array(z.string().max(50)).max(10).optional(),
    budget: z.string().max(50).optional(),
    preference: z.string().max(20).optional(),
    allergies: z.string().max(300).optional(),
    pregnant: z.boolean().optional(),
    favoriteBrands: z.string().max(200).optional(),
  }),
});

const KNOWLEDGE_BASE = `
COSMETIC PRODUCT KNOWLEDGE (use actively when recommending):

EGYPTIAN / LOCAL PHARMACY BRANDS (price-friendly, widely available in Egyptian pharmacies):
- Eva Skin Clinic, Eva Cosmetics — affordable cleansers, sunscreens, vitamin C lines.
- Beesline (Lebanese, popular in Egypt) — whitening, lip care, natural-leaning.
- Bioderma (imported but pharmacy-staple) — Sensibio, Hydrabio, Sebium ranges.
- La Roche-Posay — Effaclar (acne), Toleriane (sensitive), Anthelios (SPF).
- Vichy — Mineral 89, Normaderm, Liftactiv.
- Avene — Cleanance, Tolerance, Hydrance.
- CeraVe — Hydrating Cleanser, Foaming Cleanser, SA Cleanser, Moisturizing Cream, AM/PM lotions.
- The Ordinary — Niacinamide 10%+Zinc, Hyaluronic Acid, Azelaic Acid 10%, Retinol, AHA 30%+BHA 2%.
- Garnier, L'Oreal Paris, Neutrogena, Cetaphil — mass-market staples.
- Isis Pharma, Ducray, Uriage, SVR, Noreva — pharmacy-tier French derm brands.

KOREAN (K-BEAUTY) BRANDS:
- COSRX (Snail Mucin, Advanced Snail 96, Salicylic Acid Daily Gentle Cleanser, Centella).
- Beauty of Joseon (Glow Serum, Relief Sun SPF, Dynasty Cream).
- Some By Mi (AHA-BHA-PHA 30 Days Miracle line).
- Pyunkang Yul, Anua, Skin1004 (Centella Madagascar), Mixsoon, Round Lab, Klairs, Innisfree, Laneige.

INTERNATIONAL / PREMIUM:
- Paula's Choice (BHA 2%, 10% Niacinamide booster).
- SkinCeuticals (CE Ferulic, Phloretin CF, Hydrating B5).
- Drunk Elephant, Sunday Riley, Murad, Kiehl's, Estee Lauder, Clinique.
- Olay (Regenerist, Retinol 24).

ACTIVE INGREDIENTS QUICK MAP:
- Niacinamide 5–10%: oil control, pores, post-acne marks. Pairs with almost everything.
- Salicylic Acid (BHA) 0.5–2%: oily/acne, blackheads. Avoid heavy use in pregnancy.
- Azelaic Acid 10–20%: redness, rosacea, acne, pigmentation. Pregnancy-safe.
- Retinol / Retinaldehyde / Tretinoin: anti-aging, acne. AVOID in pregnancy.
- Vitamin C (L-ascorbic acid, MAP, SAP, ascorbyl glucoside): brightening, antioxidant.
- Hyaluronic acid, glycerin, panthenol, ceramides: hydration & barrier.
- AHA (glycolic, lactic, mandelic): exfoliation, glow.
- Centella, Madecassoside: barrier repair, redness.
- Tranexamic acid, alpha arbutin, kojic acid: pigmentation.
- SPF: zinc oxide, titanium dioxide (mineral); avobenzone, tinosorb, uvinul (chemical).

PREGNANCY: avoid retinoids (retinol, tretinoin, adapalene), high-dose salicylic acid (>2%), hydroquinone, high-dose benzoyl peroxide. Safe: azelaic acid, niacinamide, vitamin C, hyaluronic acid, mineral SPF.

GENDER NOTES:
- Male skin: thicker, more sebum, larger pores. Favor lightweight gels, oil-control, post-shave soothing (panthenol, centella), simpler 3-step routines.
- Female skin: more variation; tailor to concern & life-stage (pregnancy, hormonal acne, melasma).

OBJECTION-HANDLING SCRIPTS:
- "Too expensive" → break down cost-per-day, highlight clinical actives & concentration, offer Egyptian alternative with similar actives.
- "Will it actually help?" → cite mechanism + realistic timeline (e.g. niacinamide 4–8 weeks).
- "Why this product?" → tie to their specific skin type / concern / budget answer.
- "Do I really need a serum?" → explain layering hierarchy: cleanse → treat (serum) → moisturize → protect (SPF).
- "What's the difference between these two?" → compare actives, concentration, formulation, price-per-ml.

BUNDLE LOGIC:
- Cleanser → always pair with moisturizer + SPF (AM) at minimum.
- Active serum (retinol/AHA/BHA) → pair with barrier moisturizer + SPF (mandatory).
- Vitamin C → pair with SPF (mandatory) + hydrator.
`;

function buildSystemPrompt(
  role: string,
  lang: string,
  answerStyle: string,
  profile: z.infer<typeof InputSchema>["profile"],
) {
  const detailed = answerStyle === "detailed";

  const prefs = [
    profile.name && `الاسم: ${profile.name}`,
    profile.recommendFor && `الترشيح لـ: ${profile.recommendFor}`,
    profile.gender && `النوع: ${profile.gender}`,
    profile.skinType && `نوع البشرة: ${profile.skinType}${profile.combinationZone ? ` (${profile.combinationZone.toUpperCase()})` : ""}`,
    profile.concerns?.length && `المشاكل: ${profile.concerns.join(", ")}`,
    profile.budget && `الميزانية: ${profile.budget}`,
    profile.allergies && `حساسية: ${profile.allergies}`,
    profile.pregnant && `حامل: نعم (تجنب الرتينويد، السالسيليك >2%، الهيدروكينون)`,
  ]
    .filter(Boolean)
    .join("\n");

  const persona = `أنت "سو سكين" (SoSkin)، خبير بشرة مصري.

قواعد الرد السريع:
1. عند السؤال عن سعر أو توفر منتج: قول صراحة "السعر يفضل تتأكد منه من الصيدلية (العزبي / عز الدين / صيدليات مصر)" — ما تألفش سعر.
2. لو مش متأكد من السعر، قول "السعر غير متاح حالياً".
3. أسلوب "الخلاصة": الاسم + السعر التقديري (لو معروف) + الرأي العلمي في جملة واحدة.
4. ممنوع الـ HTML أو الأكواد في الرد. كلام بشري مختصر بس.


قواعد صارمة (ممنوع تجاوزها):
- ممنوع تماماً تأليف أسماء منتجات. التزم فقط بمنتجات معروفة في الصيدليات المصرية (إيفا، بوبانا، ستارڤيل، يورياج، لاروش بوزيه، فيشي، بيبانثين، سيتافيل، CeraVe، The Ordinary، Bioderma، Avene، Garnier...) أو من قائمة الكتالوج المرفقة أدناه.
- لو مش متأكد 100% من وجود منتج/معلومة في السوق المصري، قول صراحة: "المعلومة دي مش متوفرة عندي حالياً" أو "المنتج ده مش مألوف في السوق المصري".
- في تحليل المكونات: اعتمد فقط على ما تراه في الصورة أو ما تعرفه علمياً. ما تخمنش مكونات إضافية.
- الأسعار: استخدم فقط الأسعار الموجودة في الكتالوج المرفق. لو المنتج مش في الكتالوج قول "السعر يفضل تتأكد منه من الصيدلية".


مهمتك: مساعدة المستخدم في العناية ببشرته وتحليل المنتجات.

قواعد الرد الإجبارية:
1. الاختصار هو الأساس: الرد في حدود جملتين أو 3 جمل كحد أقصى${detailed ? " (يمكن التوسع قليلاً عند طلب شرح تفصيلي، لكن دون إطالة مملة)" : ""}.
2. اللهجة: لهجة مصرية بيضاء بسيطة، ودودة ومفهومة زي الصيدلي الشاطر.
3. تحليل المنتجات: عند رؤية صورة منتج، استخرج "المادة الفعالة" و"نوع البشرة المناسب" فقط.
4. البدائل الأرخص: ما تقترحش بديل أرخص إلا لو العميل طلب صراحة "الأرخص" أو "بديل اقتصادي" أو حدد ميزانية معينة. لو سأل على فيشي أو لاروش بوزيه أو يورياج، تكلم على المنتج نفسه زي البياع الشاطر — مميزاته وطريقة استخدامه. لما يطلب الأرخص، اقترح بديل بنفس الاستخدام والمادة الفعالة من براندات أرخص معروفة في الصيدليات المصرية.
5. الترحيب: ممنوع المقدمات الرسمية (مثل "أهلاً بك أنا ذكاء اصطناعي"). ادخل في الموضوع فوراً.
6. إذا كانت الصورة غير واضحة، قل: "الصورة مش واضحة يا ريس، ممكن تصور المكونات بوضوح؟".
7. الأسعار: ما تخترعش أسعار. لو مش متأكد قول "السعر يفضل تتأكد منه من الصيدلية".
8. خلي الكلام مباشر — من غير قوائم طويلة ولا عناوين كتيرة.

${lang === "en" ? "If the user writes in English, reply in concise English keeping the same direct tone." : "رد دايماً بالعربي إلا لو المستخدم كاتب بالإنجليزي."}

بروفايل المستخدم:
${prefs || "(لا يوجد بيانات)"}`;

  return persona;
}


export const Route = createFileRoute("/api/public/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof InputSchema>;
        try {
          body = InputSchema.parse(await request.json());
        } catch (e) {
          return new Response(JSON.stringify({ error: "Invalid request" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        let system = buildSystemPrompt(
          body.role,
          body.lang,
          body.answerStyle ?? "quick",
          body.profile,
        );

        try {
          const streamBody = await callAI({
            model: "gemini-3-flash-preview",
            stream: true,
            messages: [{ role: "system", content: system }, ...body.messages],
          });

          return new Response(streamBody as any, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
            },
          });
        } catch (error: any) {
          console.error("AI gateway error", error);
          return new Response(JSON.stringify({ error: error.message || "AI request failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
