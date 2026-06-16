import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — SoSkin" },
      { name: "description", content: "How SoSkin collects, uses, and protects your data." },
    ],
  }),
  component: PrivacyPage,
});

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="font-semibold text-base mb-1.5">{children}</h2>;
}

function PrivacyPage() {
  const { profile } = useProfile();
  const ar = profile.lang === "ar";
  return (
    <>
      <MobileShell>
        <Link to="/settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> {ar ? "رجوع" : "Back"}
        </Link>

        <h1 className="text-2xl font-bold mb-1">{ar ? "سياسة الخصوصية" : "Privacy Policy"}</h1>
        <p className="text-xs text-muted-foreground mb-6">{ar ? "آخر تحديث: مايو 2026" : "Last updated: May 2026"}</p>

        <article className="space-y-5 text-sm leading-relaxed text-foreground/90">
          {ar ? (
            <>
              <section>
                <H>١. البيانات التي نجمعها</H>
                <ul className="list-disc ms-5 space-y-1">
                  <li>الحساب: البريد، الاسم، الصورة (اختياري).</li>
                  <li>ملف البشرة والشعر: النوع، المخاوف، الميزانية، الحساسية، حالة الحمل.</li>
                  <li>صور البشرة/الشعر/المنتجات التي ترفعينها.</li>
                  <li>سجل الاستخدام: الفحوصات، المحادثات، الروتين، Streak.</li>
                </ul>
              </section>
              <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                <H>٢. خصوصية الصور والبيانات الحيوية (GDPR / CCPA)</H>
                <p>
                  جميع صور البشرة والشعر المرفوعة في Progress Tracker <strong>مشفّرة بالكامل</strong>،
                  خاصة بحسابك فقط، و<strong>لن تُشارك أو تُباع أو تُكشف لأي طرف ثالث</strong> أبدًا.
                  بياناتك الحيوية (الحمل، الحساسية، الحالة الجلدية) تُعامل كـ<strong>بيانات صحية سرية</strong>.
                </p>
              </section>
              <section>
                <H>٣. كيف نستخدم البيانات</H>
                <p>لتشغيل التحليلات، تخصيص التوصيات، وتحسين الخدمة. لا نبيع بياناتك لأي طرف ثالث.</p>
              </section>
              <section>
                <H>٤. مشاركة البيانات</H>
                <p>
                  المحتوى الذي ترفعينه يُرسَل لمزودي نماذج الذكاء الاصطناعي (Google / OpenAI) <strong>فقط
                  لتنفيذ طلبك اللحظي</strong>، ولا يُستخدم لتدريب نماذج عامة. يُخزَّن بأمان على Lovable Cloud.
                </p>
              </section>
              <section>
                <H>٥. الإفصاح التجاري</H>
                <p>
                  يشارك SoSkin في برامج تسويق بالعمولة (نون، أمازون...) وقد نحصل على عمولة من الشراء عبر
                  Smart Affiliate Marketplace. لا تتحمل SoSkin مسؤولية الشحن أو الأسعار أو الإرجاع لدى البائع.
                </p>
              </section>
              <section>
                <H>٦. حقوقك</H>
                <ul className="list-disc ms-5 space-y-1">
                  <li>الوصول والتعديل من "تعديل الملف".</li>
                  <li>حذف الحساب بالكامل من <Link to="/delete-account" className="text-primary underline">صفحة حذف الحساب</Link>.</li>
                  <li>سحب الموافقة في أي وقت بتسجيل الخروج.</li>
                </ul>
              </section>
              <section>
                <H>٧. الأطفال</H>
                <p>التطبيق غير موجّه للأطفال دون 13 عامًا.</p>
              </section>
              <section>
                <H>٨. تواصل</H>
                <p><a className="text-primary underline" href="mailto:omar.soliman.092@gmail.com">omar.soliman.092@gmail.com</a></p>
              </section>
            </>
          ) : (
            <>
              <section>
                <H>1. Data we collect</H>
                <ul className="list-disc ms-5 space-y-1">
                  <li>Account: email, name, optional avatar.</li>
                  <li>Skin & hair profile: type, concerns, budget, allergies, pregnancy status.</li>
                  <li>Skin / hair / product photos you upload.</li>
                  <li>Usage history: scans, chats, routines, streak.</li>
                </ul>
              </section>
              <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                <H>2. Photo & Biological Data Privacy (GDPR / CCPA)</H>
                <p>
                  All skin and hair photos uploaded to the Progress Tracker are <strong>fully encrypted</strong>,
                  private to your account, and will <strong>never be shared, sold, or exposed to third
                  parties</strong>. Personal biological data (pregnancy, allergies, skin conditions) is treated
                  as <strong>confidential health data</strong>.
                </p>
              </section>
              <section>
                <H>3. How we use it</H>
                <p>To power analyses, personalize recommendations, and improve the service. We never sell your data.</p>
              </section>
              <section>
                <H>4. Sharing</H>
                <p>
                  Uploaded content is sent to AI providers (Google / OpenAI) <strong>solely to fulfill your
                  immediate request</strong>; it is not used to train public models. Data is stored securely on
                  Lovable Cloud.
                </p>
              </section>
              <section>
                <H>5. Commercial disclosure</H>
                <p>
                  SoSkin participates in affiliate programs (Noon, Amazon, etc.) and may earn commissions from
                  purchases via the Smart Affiliate Marketplace. SoSkin is not responsible for retailer
                  inventory, shipping, pricing, or returns.
                </p>
              </section>
              <section>
                <H>6. Your rights</H>
                <ul className="list-disc ms-5 space-y-1">
                  <li>Access and edit data from "Edit Profile".</li>
                  <li>Delete account entirely from <Link to="/delete-account" className="text-primary underline">Delete Account</Link>.</li>
                  <li>Withdraw consent any time by signing out.</li>
                </ul>
              </section>
              <section>
                <H>7. Children</H>
                <p>SoSkin is not directed to children under 13.</p>
              </section>
              <section>
                <H>8. Contact</H>
                <p><a className="text-primary underline" href="mailto:omar.soliman.092@gmail.com">omar.soliman.092@gmail.com</a></p>
              </section>
            </>
          )}
        </article>
      </MobileShell>
      <BottomNav />
    </>
  );
}
