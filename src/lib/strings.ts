// Centralized user-facing copy. Single source of truth — every component
// that displays static labels should read from here so wording stays
// identical across screens and language toggles do not cause flicker.

export type Lang = "ar" | "en";
export type Bilingual = { ar: string; en: string };

export const STRINGS = {
  brand: {
    name: "S.O.SKIN",
    tagline: {
      ar: "مستشارك الذكي للعناية بالبشرة",
      en: "Your AI-powered skincare advisor",
    } as Bilingual,
    taglineExpert: {
      ar: "وضع الخبير — VIP",
      en: "Expert mode — VIP",
    } as Bilingual,
  },
  home: {
    smartTools: { ar: "أدوات ذكية", en: "Smart tools" } as Bilingual,
    manage: { ar: "تنظيم", en: "Manage" } as Bilingual,
    credit: {
      ar: "تم تطويره بواسطة عمر سليمان",
      en: "Developed by Omar Soliman",
    } as Bilingual,
  },
  banner: {
    title: { ar: "S.O.SKIN", en: "S.O.SKIN" } as Bilingual,
    subtitle: {
      ar: "مستشارك الذكي للعناية بالبشرة",
      en: "Your AI-powered skincare advisor",
    } as Bilingual,
  },
  trial: {
    label: {
      ar: "تجربة مجانية مفتوحة لكل المميزات",
      en: "Free trial — all features unlocked",
    } as Bilingual,
    remaining: {
      ar: (days: number) => `متبقي ${days} يوم`,
      en: (days: number) => `${days} days left`,
    },
  },
  academy: {
    title: { ar: "إشعار الأكاديمية الرسمي", en: "Official Academy Notification" } as Bilingual,
    welcome: {
      ar: "أهلاً بك في منصة SoSkin. تم ربط حسابك بنجاح وأنت الآن جاهز لاستخدام المستشار الذكي للعناية ببشرتك وشعرك بأحدث تقنيات الذكاء الاصطناعي.",
      en: "Welcome to SoSkin. Your account has been successfully linked and you are now ready to use the AI-powered skincare and hair care advisor.",
    } as Bilingual,
    start: { ar: "ابدأ الاستكشاف الآن", en: "Start Exploring Now" } as Bilingual,
    close: { ar: "إغلاق", en: "Close" } as Bilingual,
  },
  common: {
    skip: { ar: "تخطّى", en: "Skip" } as Bilingual,
    back: { ar: "رجوع", en: "Back" } as Bilingual,
    next: { ar: "التالي", en: "Next" } as Bilingual,
    done: { ar: "تم — يلا نبدأ", en: "Done — let's go" } as Bilingual,
  },
} as const;

export const t = (b: Bilingual, lang: Lang) => b[lang];
