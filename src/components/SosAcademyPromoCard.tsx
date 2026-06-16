import { useProfile } from "@/hooks/useProfile";
import { GraduationCap, MessageCircle } from "lucide-react";

const PHONE = "+201141519948";

function getWaUrl(isPro: boolean, isMale: boolean): string {
  const consumerText = isMale
    ? "أهلاً S.O.S Academy، أنا مستخدم لتطبيق S.o.Skin وأود الاستفسار عن كورس احتراف العناية بالبشرة والشعر وتفاصيل التسجيل."
    : "أهلاً S.O.S Academy، أنا مستخدمة لتطبيق S.o.Skin وأود الاستفسار عن كورس احتراف العناية بالبشرة والشعر وتفاصيل التسجيل.";
  const expertText = isMale
    ? "أهلاً S.O.S Academy، أنا مستشار تجميل في تطبيق S.o.Skin وأود الانضمام لأكاديمية الاحتراف لتطوير مهاراتي البيعية والعلمية."
    : "أهلاً S.O.S Academy، أنا مستشارة تجميل في تطبيق S.o.Skin وأود الانضمام لأكاديمية الاحتراف لتطوير مهاراتي البيعية والعلمية.";
  const text = encodeURIComponent(isPro ? expertText : consumerText);
  return `https://wa.me/${PHONE.replace(/\+/g, "")}?text=${text}`;
}

export function SosAcademyPromoCard() {
  const { profile } = useProfile();
  const ar = profile.lang === "ar";
  const isPro = profile.role === "expert";
  const isMale = profile.gender === "male";

  const subtitle = ar
    ? isPro
      ? isMale
        ? "- طوّر مهاراتك البيعية والعلمية مع أقوى منصة تدريب\n- للإستشارات والمقترحات"
        : "- طوّري مهاراتك البيعية والعلمية مع أقوى منصة تدريب\n- للإستشارات والمقترحات"
      : isMale
        ? "تعلّم أسرار العناية بالبشرة والشعر مع خبراء S.o.Skin"
        : "تعلّمي أسرار العناية بالبشرة والشعر مع خبراء S.o.Skin"
    : isPro
      ? "Upgrade your sales & science skills with S.o.Skin's top training platform"
      : "Learn the secrets of skin & hair care with S.o.Skin experts";

  const cta = ar
    ? "تواصل مع خدمة العملاء عبر الواتساب ➔"
    : "Contact customer service via WhatsApp ➔";

  return (
    <a
      href={getWaUrl(isPro, isMale)}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block overflow-hidden rounded-2xl border-2 border-primary gradient-aurora p-4 shadow-glow hover:opacity-95 transition-all"
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary-foreground/20 blur-3xl pointer-events-none" />

      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-foreground/15 border border-primary-foreground/30 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary-foreground">
            SOS ACADEMY
          </span>
        </div>
        <span className="text-[10px] font-semibold text-primary-foreground/85 uppercase tracking-wider">
          {ar ? "احجز مقعدك" : "Reserve your seat"}
        </span>
      </div>

      <p className="relative text-xs text-primary-foreground/90 leading-relaxed mb-3 font-medium whitespace-pre-line">
        {subtitle}
      </p>

      <div className="relative flex items-center gap-2 rounded-xl bg-primary-foreground/15 px-3 py-2.5 border border-primary-foreground/30">
        <MessageCircle className="w-4 h-4 text-primary-foreground shrink-0" />
        <span className="text-xs font-bold text-primary-foreground">
          {cta}
        </span>
      </div>
    </a>
  );
}
