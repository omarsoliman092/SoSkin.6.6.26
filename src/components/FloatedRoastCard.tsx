import { useEffect, useState } from "react";
import { Flame, Heart, Droplets, X } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useDailyScore } from "@/hooks/useDailyScore";

type Slot = "morning" | "midday" | "night";
const KEY = "soskin_roast_shown_v1";

function getShown(): Record<string, Slot[]> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
function markShown(date: string, slot: Slot) {
  const s = getShown();
  s[date] = Array.from(new Set([...(s[date] || []), slot]));
  localStorage.setItem(KEY, JSON.stringify(s));
}
function currentSlot(): Slot {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "midday";
  return "night";
}

function buildMessage(
  slot: Slot,
  mode: "roast" | "praise",
  ar: boolean,
  completed: number,
  total: number,
): { title: string; body: string; icon: "flame" | "heart" | "drop" } {
  const ratio = total > 0 ? completed / total : 0;
  if (slot === "midday") {
    return {
      icon: "drop",
      title: ar ? "💧 تذكير ترطيب" : "💧 Hydration check",
      body: mode === "roast"
        ? ar
          ? "حاجز بشرتك بيصرخ من العطش وانتي مش شايفة الميّة؟ اشربي قبل ما السيرومات الغالية تبقى نكتة."
          : "Your skin barrier is literally screaming for hydration, and you're still ignoring your water bottle. Drink up before your expensive serums turn into a joke."
        : ar
        ? "كوباية ميّة دلوقتي = توهج بكره. أنتي قد التحدي 💖"
        : "A glass of water now = glow tomorrow. You've got this 💖",
    };
  }
  if (slot === "morning") {
    const done = ratio >= 0.7;
    return {
      icon: mode === "roast" ? "flame" : "heart",
      title: ar ? (done ? "روتين الصبح ✓" : "روتين الصبح؟") : (done ? "Morning routine ✓" : "Morning routine?"),
      body: done
        ? mode === "roast"
          ? ar ? "ماشاء الله، لسه فاكرة إن عندك بشرة. كملي كده." : "Wow, you actually remembered you have skin. Keep it up."
          : ar ? "بدأتي صح — هيبان عليكي اليوم ✨" : "Strong start — it'll show today ✨"
        : mode === "roast"
        ? ar ? "نص الناس صحيت غسلت وشها. وانتي؟ الـ Retinol اللي اشتريتيه بيتفرج عليكي." : "Half the world washed their face already. Your retinol is watching you ignore it."
        : ar ? "خمس دقايق روتين = فرق حقيقي. ابدئي الآن 🌅" : "Five minutes of routine = real difference. Start now 🌅",
    };
  }
  // night
  return {
    icon: mode === "roast" ? "flame" : "heart",
    title: ar ? "تقييم الليلة" : "Tonight's verdict",
    body: ratio >= 0.7
      ? mode === "roast"
        ? ar ? "اليوم كان احترافي. مش عارفة إذا أهنيكي ولا أتفاجئ." : "Today was actually pro. I'm impressed and slightly shocked."
        : ar ? "يوم كامل التزام — ده الفرق 🌙" : "Full consistency today — this is the difference 🌙"
      : mode === "roast"
      ? ar ? "بتجمعي منتجات أكتر مما بتستخدميها. ده اسمه Skin Hoarding مش روتين." : "You're buying products faster than using them. That's hoarding, not skincare."
      : ar ? "بكره فرصة جديدة — خطوة واحدة تكفي." : "Tomorrow's a fresh start — one step is enough.",
  };
}

export function FloatedRoastCard() {
  const { profile } = useProfile();
  const { today } = useDailyScore();
  const [visible, setVisible] = useState(false);
  const [slot, setSlot] = useState<Slot>("morning");
  const [msg, setMsg] = useState<ReturnType<typeof buildMessage> | null>(null);
  const ar = profile.lang === "ar";
  const mode = profile.roastMode ?? "roast";

  useEffect(() => {
    if (mode === "off" || profile.role === "expert") return;
    const date = new Date().toISOString().slice(0, 10);
    const s = currentSlot();
    const shown = getShown()[date] || [];
    if (shown.includes(s) || shown.length >= 3) return;
    const t = setTimeout(() => {
      const m = buildMessage(s, mode, ar, today?.completed_steps ?? 0, today?.total_steps ?? 0);
      setSlot(s);
      setMsg(m);
      setVisible(true);
      markShown(date, s);
    }, 4500);
    return () => clearTimeout(t);
  }, [mode, profile.role, ar, today?.completed_steps, today?.total_steps]);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(t);
  }, [visible]);

  if (!visible || !msg) return null;
  const Icon = msg.icon === "drop" ? Droplets : msg.icon === "heart" ? Heart : Flame;
  const accent = msg.icon === "drop" ? "text-sky-400" : mode === "roast" ? "text-orange-400" : "text-pink-400";
  const border = msg.icon === "drop" ? "border-sky-500/30" : mode === "roast" ? "border-orange-500/30" : "border-pink-500/30";

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 pointer-events-none">
      <div
        className={`pointer-events-auto max-w-sm w-full rounded-2xl border ${border} bg-card/95 backdrop-blur-xl shadow-glow p-3.5 flex items-start gap-3 animate-float-up`}
        role="status"
        aria-live="polite"
      >
        <div className={`w-9 h-9 rounded-xl bg-background/50 flex items-center justify-center shrink-0 ${accent}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] uppercase tracking-wider opacity-70 mb-0.5">{ar ? "SoSkin" : "SoSkin"} · {slot}</div>
          <div className="text-sm font-semibold leading-snug mb-1">{msg.title}</div>
          <div className="text-xs text-muted-foreground leading-relaxed">{msg.body}</div>
        </div>
        <button
          onClick={() => setVisible(false)}
          aria-label="Close"
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
