import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

const KEY = "soskin_tour_v1_done";

type Step = {
  target: string; // data-tour="..."
  title: { ar: string; en: string };
  body: { ar: string; en: string };
};

export function FeatureTour({ lang }: { lang: "ar" | "en" }) {
  const ar = lang === "ar";
  const navigate = useNavigate();
  const triggered = useRef(false);
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const steps: Step[] = [
    {
      target: "sos-button",
      title: { ar: "زرار الـ SOS", en: "The SOS button" },
      body: {
        ar: "اضغط عليه لأي طارئ في بشرتك — حروق، حساسية، حبوب مفاجئة. هيدّيك حل فوري.",
        en: "Tap for any skin emergency — burns, reactions, sudden breakouts. Instant guidance.",
      },
    },
    {
      target: "streak-card",
      title: { ar: "متتالية العناية اليومية", en: "Daily care streak" },
      body: {
        ar: "كل يوم تكمل روتينك بتزوّد المتتالية وتفتح مكافآت.",
        en: "Every day you stick to your routine grows your streak and unlocks rewards.",
      },
    },
    {
      target: "smart-tools",
      title: { ar: "الأدوات الذكية", en: "Smart tools" },
      body: {
        ar: "كل وظيفة في التطبيق — تحليل منتج، مقارنة، بدائل، تذكيرات — في مكان واحد.",
        en: "Every feature — analyze, compare, dupes, reminders — all in one grid.",
      },
    },
    {
      target: "theme-toggle",
      title: { ar: "ثيم الألوان", en: "Theme switch" },
      body: {
        ar: "بدّل بين الأبيض الذهبي والأسود الذهبي حسب راحتك.",
        en: "Switch between gold-on-white and gold-on-black anytime.",
      },
    },
    {
      target: "lang-toggle",
      title: { ar: "اللغة", en: "Language" },
      body: { ar: "بدّل بين العربي والإنجليزي بضغطة.", en: "Toggle Arabic / English in one tap." },
    },
    {
      target: "bottom-nav",
      title: { ar: "التنقّل السريع", en: "Quick navigation" },
      body: {
        ar: "من هنا تتنقل بين الرئيسية، الفحص، الشات، والأكاديمية.",
        en: "Jump between Home, Scan, Chat, and Academy.",
      },
    },
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (triggered.current) return;
    triggered.current = true;
    try {
      if (localStorage.getItem(KEY) === "1") return;
    } catch {}
    const t = setTimeout(() => setActive(true), 500);
    return () => clearTimeout(t);
  }, []);


  useLayoutEffect(() => {
    if (!active) return;
    const measure = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${steps[step].target}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Allow scroll to settle then measure
        setTimeout(() => setRect(el.getBoundingClientRect()), 220);
      } else {
        setRect(null);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [active, step]);

  if (!active) return null;

  const finish = (goToScan = false) => {
    try { localStorage.setItem(KEY, "1"); } catch {}
    setActive(false);
    if (goToScan) navigate({ to: "/scan" });
  };

  const next = () => (step < steps.length - 1 ? setStep(step + 1) : finish(true));
  const prev = () => step > 0 && setStep(step - 1);

  // Tooltip position: below the element if room, else above
  const padding = 12;
  const tooltipTop = (() => {
    if (!rect) return window.innerHeight / 2 - 80;
    const belowSpace = window.innerHeight - rect.bottom;
    return belowSpace > 220 ? rect.bottom + padding : Math.max(16, rect.top - 220);
  })();

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[100]" aria-modal="true" role="dialog">
      {/* Dim backdrop with spotlight cut-out via box-shadow */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => finish(false)} />
      {rect && (
        <div
          className="absolute rounded-2xl ring-4 ring-primary pointer-events-none transition-all duration-300"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.72)",
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[min(92vw,360px)] rounded-3xl border border-primary/40 bg-card shadow-glow p-5 animate-float-up"
        style={{ top: tooltipTop }}
        dir={ar ? "rtl" : "ltr"}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-primary font-bold">
              {ar ? `جولة ${step + 1}/${steps.length}` : `Tour ${step + 1}/${steps.length}`}
            </div>
          </div>
          <button
            onClick={() => finish(false)}
            aria-label={ar ? "تخطّى" : "Skip"}
            className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-foreground">{current.title[lang]}</h3>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{current.body[lang]}</p>

        <div className="flex gap-1.5 mt-4 mb-3">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= step ? "gradient-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {step > 0 && (
            <button
              onClick={prev}
              className="h-10 px-4 rounded-xl border border-border text-xs font-semibold flex items-center gap-1"
            >
              {ar ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              {ar ? "رجوع" : "Back"}
            </button>
          )}
          <button
            onClick={next}
            className="flex-1 h-10 rounded-xl gradient-primary text-primary-foreground text-sm font-bold shadow-glow flex items-center justify-center gap-1.5"
          >
            {step === steps.length - 1 ? (ar ? "تم — يلا نبدأ" : "Done — let's go") : ar ? "التالي" : "Next"}
            {ar ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
