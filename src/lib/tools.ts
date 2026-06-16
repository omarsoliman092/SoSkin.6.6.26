import { ScanLine, MessageCircle, Scale, Zap, CalendarDays, ShieldAlert, GraduationCap, FlaskConical, History, ShieldCheck, Camera, Trophy, IdCard, Copy, BookOpen, Clock, Shield, TrendingUp, MessageSquare } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export type ToolDef = {
  key: string;
  to: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: { en: string; ar: string };
  expert?: boolean; // expert-only
  alwaysOn?: boolean; // can't be hidden
};

export const ALL_TOOLS: ToolDef[] = [
  { key: "trust", to: "/trust", icon: ShieldCheck, label: { en: "Trust Score", ar: "Trust Score" } },
  { key: "builder", to: "/builder", icon: CalendarDays, label: { en: "Routine", ar: "صمم روتينك" } },
  { key: "progress", to: "/progress", icon: Camera, label: { en: "Before/After", ar: "قبل وبعد" } },
  
  { key: "conflicts", to: "/conflicts", icon: FlaskConical, label: { en: "Conflicts", ar: "تعارضات" } },
  { key: "dupes", to: "/dupes", icon: Copy, label: { en: "Alternatives", ar: "بدائل" } },
  { key: "university", to: "/university", icon: BookOpen, label: { en: "Active Ingredients", ar: "قاموس المواد الفعّالة" } },
  { key: "expiry", to: "/expiry", icon: Clock, label: { en: "Expiry Alarm", ar: "منبه إنتهاء الصلاحية" } },
  { key: "beauty-pass", to: "/beauty-pass", icon: IdCard, label: { en: "VIP Follow Up", ar: "VIP Follow Up" }, expert: true },
  { key: "replenish", to: "/replenish", icon: MessageSquare, label: { en: "WA Replenish", ar: "واتساب متابعة" }, expert: true },
  { key: "objections", to: "/objections", icon: Shield, label: { en: "Objections", ar: "الاعتراضات" }, expert: true },
  { key: "trends", to: "/trends", icon: TrendingUp, label: { en: "Social Trends", ar: "ترند السوشيال" } },
  { key: "simulator", to: "/simulator", icon: GraduationCap, label: { en: "Simulator", ar: "محاكى العميل" }, expert: true },
  { key: "academy", to: "/academy", icon: Trophy, label: { en: "Academy", ar: "أكاديمية" }, expert: true },
  { key: "history", to: "/history", icon: History, label: { en: "History", ar: "السجل" }, alwaysOn: true },
];

export const PRIMARY_EXPERT = [
  { to: "/copilot", icon: Zap, label: { en: "Customer In Front Of Me", ar: "العميل أمامي" }, sub: { en: "3-click instant sales plan", ar: "خطة بيع فورية بـ 3 ضغطات" } },
  { to: "/scan", icon: ScanLine, label: { en: "Investigate Product", ar: "افحص منتج" }, sub: { en: "Photo & instant analysis", ar: "تصوير وتحليل فوري" } },
  { to: "/compare", icon: Scale, label: { en: "Compare Products", ar: "قارن منتجات" }, sub: { en: "Side by side", ar: "مقارنات-تفضيلات-ما الأفضل لبشرتك" } },
] as const;

export const PRIMARY_CUSTOMER = [
  { to: "/scan", search: { tab: "face" as const }, icon: Camera, label: { en: "Know Your Skin Type", ar: "اعرف نوع بشرتك" }, sub: { en: "3-angle face scan with AI", ar: "صوّر وشك من 3 زوايا والـ AI يحدد نوع بشرتك" } },
  { to: "/scan", search: { tab: "product" as const }, icon: ScanLine, label: { en: "Investigate Product", ar: "افحص منتج" }, sub: { en: "Scan any product's ingredients via mobile camera instantly", ar: "افحص مكونات أي منتج عبر كاميرا الموبايل فوراً" } },
  { to: "/chat", icon: MessageCircle, label: { en: "Ask SoSkin", ar: "اسأل SoSkin" }, sub: { en: "Smart conversation", ar: "محادثة ذكية" } },
  { to: "/compare", icon: Scale, label: { en: "Compare Products", ar: "قارن منتجات" }, sub: { en: "Side by side", ar: "مقارنات-تفضيلات-ما الأفضل لبشرتك" } },
] as const;

