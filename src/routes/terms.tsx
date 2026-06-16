import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — SoSkin" },
      { name: "description", content: "Terms governing use of the SoSkin app." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { profile } = useProfile();
  const ar = profile.lang === "ar";
  return (
    <>
      <MobileShell>
        <Link to="/settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> {ar ? "رجوع" : "Back"}
        </Link>

        <h1 className="text-2xl font-bold mb-1">{ar ? "شروط الاستخدام" : "Terms & Conditions"}</h1>
        <p className="text-xs text-muted-foreground mb-6">{ar ? "آخر تحديث: مايو 2026" : "Last updated: May 2026"}</p>

        <article className="space-y-5 text-sm leading-relaxed text-foreground/90">
          {ar ? <AR /> : <EN />}
        </article>
      </MobileShell>
      <BottomNav />
    </>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="font-semibold text-base mb-1.5">{children}</h2>;
}

function EN() {
  return (
    <>
      <section>
        <H>1. Acceptance of Terms</H>
        <p>By using SoSkin you agree to these Terms & Conditions. If you don't agree, do not use the app.</p>
      </section>
      <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
        <H>2. Medical & AI Disclaimer</H>
        <p>
          SoSkin is an <strong>AI-powered beauty assistant and educational platform</strong>. It is
          <strong> NOT a medical device, dermatologist, or licensed medical professional</strong>. All AI
          recommendations, product compatibility scores, Trust Scores, "SOS Mode" rescue protocols, ingredient
          analyses and routine builders are provided for <strong>informational and educational purposes only</strong>.
        </p>
        <p className="mt-2">
          SoSkin disclaims all liability for any skin adverse reactions, allergies, irritation, or damages
          resulting from product purchase or usage. Always perform a 48-hour patch test before applying a new
          product and consult a licensed dermatologist for any medical condition, pregnancy, or persistent issue.
        </p>
      </section>
      <section>
        <H>3. Photo & Biological Data Privacy</H>
        <p>
          Skin and hair photos uploaded to the Progress Tracker are <strong>encrypted at rest</strong>, stored
          privately under your account, and will <strong>never be shared, sold, or exposed to third parties</strong>.
          Personal biological data (pregnancy status, allergies, skin conditions, hormonal context) is treated as
          <strong> confidential health data</strong> under GDPR / CCPA standards.
        </p>
      </section>
      <section>
        <H>4. Commercial & Affiliate Disclosure</H>
        <p>
          SoSkin transparently participates in affiliate marketing programs (including Noon, Amazon, and other
          retailers). We may <strong>earn a commission</strong> on qualifying purchases made through the Smart
          Affiliate Marketplace, at no extra cost to you. SoSkin is <strong>not responsible</strong> for external
          store inventory, shipping delays, pricing changes, product authenticity at the retailer, or return policies.
        </p>
      </section>
      <section>
        <H>5. Expert Model — Acceptable Use Policy</H>
        <p>
          The Expert Model (B2B in-store interface) is licensed strictly for <strong>in-store customer
          assistance</strong>. Any misuse of the Unified Beauty Pass (phone-number customer lookup) for personal
          extraction of client data, marketing outside the store of employment, resale of customer information, or
          any non-business purpose is <strong>legally prohibited</strong> and grounds for immediate account
          termination and possible legal action.
        </p>
      </section>
      <section>
        <H>6. Account & Security</H>
        <p>You are responsible for the security of your account and credentials. Report any unauthorized use immediately.</p>
      </section>
      <section>
        <H>7. Intellectual Property</H>
        <p>The SoSkin app, brand, and content are owned by Omar Soliman. No copying, redistribution, or resale.</p>
      </section>
      <section>
        <H>8. Termination</H>
        <p>You may delete your account anytime from <Link to="/delete-account" className="text-primary underline">Delete Account</Link>. We may suspend accounts violating these terms.</p>
      </section>
      <section>
        <H>9. Contact</H>
        <p><a className="text-primary underline" href="mailto:omar.soliman.092@gmail.com">omar.soliman.092@gmail.com</a></p>
      </section>
    </>
  );
}

function AR() {
  return (
    <>
      <section>
        <H>١. قبول الشروط</H>
        <p>باستخدامك SoSkin فإنك توافق على هذه الشروط والأحكام. إذا لم توافق، يرجى عدم استخدام التطبيق.</p>
      </section>
      <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
        <H>٢. إخلاء المسؤولية الطبية والذكاء الاصطناعي</H>
        <p>
          SoSkin هو <strong>مساعد جمال ذكاء اصطناعي ومنصة تعليمية</strong>. هو <strong>ليس جهازًا طبيًا ولا
          طبيب جلدية ولا متخصصًا طبيًا مرخصًا</strong>. جميع التوصيات، درجات التوافق، Trust Score، بروتوكولات
          SOS، تحليل المكونات وبناء الروتين كلها <strong>لأغراض معلوماتية وتعليمية فقط</strong>.
        </p>
        <p className="mt-2">
          يخلي SoSkin مسؤوليته من أي تحسس أو احمرار أو ضرر ناتج عن شراء أو استخدام المنتجات. اعملي
          باتش تست ٤٨ ساعة قبل أي منتج جديد، واستشيري طبيب جلدية لأي حالة طبية أو أثناء الحمل.
        </p>
      </section>
      <section>
        <H>٣. خصوصية الصور والبيانات الحيوية</H>
        <p>
          صور البشرة والشعر المرفوعة في Progress Tracker <strong>مشفّرة</strong> ومحفوظة بشكل خاص تحت حسابك، ولن
          <strong> يتم مشاركتها أو بيعها أو كشفها لأي طرف ثالث</strong>. البيانات الحيوية الشخصية (الحمل، الحساسية،
          الحالة الجلدية، الهرمونات) تُعامل كـ<strong>بيانات صحية سرية</strong> طبقًا لمعايير GDPR / CCPA.
        </p>
      </section>
      <section>
        <H>٤. الإفصاح التجاري والأفلييت</H>
        <p>
          يشارك SoSkin بشفافية في برامج تسويق بالعمولة (نون، أمازون، وغيرهم) وقد <strong>نحصل على عمولة</strong> من
          المشتريات عبر Smart Affiliate Marketplace دون أي تكلفة إضافية عليكِ. SoSkin <strong>غير مسؤول</strong>
          عن المخزون أو الشحن أو تغيّر الأسعار أو الأصالة عند البائع أو سياسات الإرجاع.
        </p>
      </section>
      <section>
        <H>٥. سياسة الاستخدام المقبول لوضع الخبير</H>
        <p>
          واجهة الخبير (B2B داخل المتجر) مرخصة <strong>حصريًا لمساعدة العميل داخل المحل</strong>. أي إساءة
          استخدام لـ Unified Beauty Pass (البحث برقم الموبايل) لاستخراج بيانات العملاء لأغراض شخصية، تسويق
          خارج محل العمل، أو إعادة بيع البيانات، <strong>ممنوع قانونيًا</strong> ويترتب عليه إلغاء الحساب فورًا
          وإجراءات قانونية محتملة.
        </p>
      </section>
      <section>
        <H>٦. الحساب والأمان</H>
        <p>أنتِ مسؤولة عن أمان حسابك. أبلغينا فورًا عن أي استخدام غير مصرح.</p>
      </section>
      <section>
        <H>٧. الملكية الفكرية</H>
        <p>التطبيق والعلامة مملوكة لـ Omar Soliman. لا يجوز النسخ أو إعادة البيع.</p>
      </section>
      <section>
        <H>٨. الإنهاء</H>
        <p>يمكنك حذف حسابك من <Link to="/delete-account" className="text-primary underline">صفحة حذف الحساب</Link>. ويحق لنا تعليق الحسابات المخالفة.</p>
      </section>
      <section>
        <H>٩. تواصل</H>
        <p><a className="text-primary underline" href="mailto:omar.soliman.092@gmail.com">omar.soliman.092@gmail.com</a></p>
      </section>
    </>
  );
}
