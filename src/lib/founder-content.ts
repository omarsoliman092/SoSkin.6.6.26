import founderImg from "@/assets/founder.jpg";

export type FounderContent = {
  name: string;
  avatarUrl: string; // either imported asset URL or base64 data URL
  titlesAr: string[];
  titlesEn: string[];
  bioAr: string;
  bioEn: string;
  highlightsAr: string[];
  highlightsEn: string[];
  stats: { labelAr: string; labelEn: string; value: string }[];
  instagram: string;
  phone: string;
};

const KEY = "soskin.founder.content.v1";

export const defaultFounder: FounderContent = {
  name: "Omar Soliman",
  avatarUrl: founderImg,
  titlesAr: [
    "المؤسس وخبير استراتيجيات ذكاء التجميل",
    "مهندس أنظمة مبيعات التجميل",
    "صانع SoSkin",
  ],
  titlesEn: [
    "Founder & Cosmetic Intelligence Strategist",
    "Beauty Sales Systems Architect",
    "Creator of SoSkin",
  ],
  bioAr:
    "عمر سليمان — استراتيجي مبيعات تجميل، مدرّب جمال، ومدير منطقة بأكثر من 7 سنوات خبرة في تجزئة مستحضرات التجميل في الصيدليات، وتعليم العناية بالبشرة، وتطوير مستشاري الجمال، وتحسين المبيعات في الإسكندرية والدلتا. متخصص في تحويل المعرفة المعقدة عن العناية بالبشرة إلى أنظمة بيع عملية واقعية تساعد مستشاري الجمال على البيع بثقة وبناء ثقة العميل.",
  bioEn:
    "Omar Soliman is a cosmetics sales strategist, beauty trainer, and district manager with over 7 years of experience in pharmacy cosmetic retail, skincare education, beauty advisor development, and sales optimization across Alexandria and Delta. He specializes in transforming complex skincare knowledge into practical, real-world sales systems that help beauty advisors sell confidently and build customer trust.",
  highlightsAr: [
    "600+ ساعة تدريب لمستشاري الجمال",
    "خبرة عميقة في العناية بالبشرة والمستحضرات",
    "أنظمة مبيعات للصيدليات",
    "استراتيجية نمو المبيعات",
    "تدريب ميداني واقعي",
  ],
  highlightsEn: [
    "600+ hours of beauty advisor training",
    "Deep skincare & cosmetics expertise",
    "Pharmacy sales systems",
    "Sales growth strategy",
    "Real-world field training",
  ],
  stats: [
    { labelAr: "ساعات تدريبية", labelEn: "Training hours", value: "600+" },
    { labelAr: "خبرة", labelEn: "Experience", value: "7+ yrs" },
    { labelAr: "تركيز", labelEn: "Focus", value: "Sales growth" },
    { labelAr: "مجال", labelEn: "Domain", value: "Pharmacy beauty" },
  ],
  instagram: "https://www.instagram.com/omar.soliman092?utm_source=qr",
  phone: "01141519948",
};

export function loadFounder(): FounderContent {
  if (typeof window === "undefined") return defaultFounder;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultFounder;
    const parsed = JSON.parse(raw);
    return { ...defaultFounder, ...parsed };
  } catch {
    return defaultFounder;
  }
}

export function saveFounder(c: FounderContent) {
  localStorage.setItem(KEY, JSON.stringify(c));
  window.dispatchEvent(new Event("founder-content-changed"));
}

export function resetFounder() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("founder-content-changed"));
}
