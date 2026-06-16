import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, Loader2, Target, ShieldCheck, MessageSquareQuote, TrendingUp, RotateCcw } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { usePaywall } from "@/hooks/usePaywall";
import { FeatureLockScreen } from "@/components/FeatureLockScreen";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";

export const Route = createFileRoute("/copilot")({
  component: CoPilotPage,
});

type AgeRange = "teen" | "20s" | "30s" | "40s" | "50plus";
type Issue =
  | "acne"
  | "dark_spots"
  | "wrinkles"
  | "dehydration"
  | "redness"
  | "dullness"
  | "sun_damage"
  | "hair_thinning";
type Budget = "low" | "mid" | "high";

interface Plan {
  diagnosis: string;
  routine: { step: number; time: string; category: string; product: string; brand: string; priceEGP: string; why: string }[];
  objections: { objection: string; counter: string }[];
  closingLine: string;
  upsell: { product: string; brand: string; why: string };
}

function CoPilotPage() {
  const { profile } = useProfile();
  const ar = profile.lang === "ar";
  const { isPro } = usePaywall();

  const [age, setAge] = useState<AgeRange | null>(null);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);

  if (!isPro) {
    return (
      <>
        <MobileShell>
          <header className="mb-2">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              {ar ? "العميل قدامى دلوقتى" : "Client in front of me"}
            </h1>
          </header>
          <FeatureLockScreen
            ar={ar}
            isExpert
            title={ar ? "Co-Pilot للبيع اللحظى" : "Live Sales Co-Pilot"}
            subtitle={
              ar
                ? "مساعد AI يبنى روتين مخصص للعميل وقت ما يكون قدامك — حصرى لرخصة الخبراء."
                : "AI co-pilot that builds a tailored routine while your client is in front of you — Expert Pro only."
            }
            benefits={
              ar
                ? [
                    "تشخيص فورى حسب العمر والمشكلة والميزانية",
                    "روتين كامل بمنتجات من السوق المصرى",
                    "ردود جاهزة على اعتراضات العميل",
                    "Upsell ذكى مدعوم بالأرقام",
                  ]
                : [
                    "Instant diagnosis by age, issue, and budget",
                    "Full routine with Egyptian-market products",
                    "Ready replies for customer objections",
                    "Smart, data-backed upsells",
                  ]
            }
          />
        </MobileShell>
        <BottomNav />
      </>
    );
  }



  const labels = {
    age: ar
      ? { teen: "أقل من 20", "20s": "20+", "30s": "30+", "40s": "40+", "50plus": "50+" }
      : { teen: "<20", "20s": "20s", "30s": "30s", "40s": "40s", "50plus": "50+" },
    issue: ar
      ? {
          acne: "حبوب",
          dark_spots: "بقع داكنة",
          wrinkles: "تجاعيد",
          dehydration: "جفاف",
          redness: "احمرار",
          dullness: "بهتان",
          sun_damage: "تلف شمس",
          hair_thinning: "تساقط شعر",
        }
      : {
          acne: "Acne",
          dark_spots: "Dark spots",
          wrinkles: "Wrinkles",
          dehydration: "Dehydration",
          redness: "Redness",
          dullness: "Dullness",
          sun_damage: "Sun damage",
          hair_thinning: "Hair thinning",
        },
    budget: ar
      ? { low: "اقتصادي\n<1000", mid: "متوسط\n1000-2500", high: "بريميوم\n2500+" }
      : { low: "Budget\n<1000", mid: "Mid\n1000-2500", high: "Premium\n2500+" },
  };

  const canRun = age && issue && budget && !loading;

  const run = async () => {
    if (!age || !issue || !budget) return;
    setLoading(true);
    setPlan(null);
    try {
      const res = await fetch("/api/public/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ageRange: age, mainIssue: issue, budget, lang: profile.lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setPlan(data as Plan);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAge(null);
    setIssue(null);
    setBudget(null);
    setPlan(null);
  };

  return (
    <>
      <MobileShell>
        <header className="flex items-center gap-3 mt-4 mb-5">
          <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold leading-tight">
              {ar ? "العميل قدامي الآن" : "Customer In Front Of Me"}
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {ar ? "خطة بيع فورية بـ 3 ضغطات" : "3-click instant sales plan"}
            </p>
          </div>
          {(age || issue || budget || plan) && (
            <button
              onClick={reset}
              className="w-9 h-9 rounded-xl border border-border flex items-center justify-center"
              aria-label="reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </header>

        {/* Step 1: Age */}
        <Section title={ar ? "1. العمر التقريبي" : "1. Approx age"}>
          <div className="grid grid-cols-5 gap-1.5">
            {(Object.keys(labels.age) as AgeRange[]).map((a) => (
              <button
                key={a}
                onClick={() => setAge(a)}
                className={`py-3 rounded-xl border text-xs font-semibold transition-all ${
                  age === a ? "border-primary bg-primary/15 shadow-glow" : "border-border bg-card"
                }`}
              >
                {labels.age[a]}
              </button>
            ))}
          </div>
        </Section>

        {/* Step 2: Issue */}
        <Section title={ar ? "2. المشكلة الأساسية" : "2. Main issue"}>
          <div className="grid grid-cols-4 gap-1.5">
            {(Object.keys(labels.issue) as Issue[]).map((i) => (
              <button
                key={i}
                onClick={() => setIssue(i)}
                className={`py-2.5 px-1 rounded-xl border text-[11px] font-medium transition-all ${
                  issue === i ? "border-primary bg-primary/15 shadow-glow" : "border-border bg-card"
                }`}
              >
                {labels.issue[i]}
              </button>
            ))}
          </div>
        </Section>

        {/* Step 3: Budget */}
        <Section title={ar ? "3. الميزانية" : "3. Budget"}>
          <div className="grid grid-cols-3 gap-1.5">
            {(Object.keys(labels.budget) as Budget[]).map((b) => (
              <button
                key={b}
                onClick={() => setBudget(b)}
                className={`py-3 rounded-xl border text-xs font-semibold transition-all whitespace-pre-line leading-tight ${
                  budget === b ? "border-primary bg-primary/15 shadow-glow" : "border-border bg-card"
                }`}
              >
                {labels.budget[b]}
              </button>
            ))}
          </div>
        </Section>

        <button
          onClick={run}
          disabled={!canRun}
          className="mt-5 w-full h-14 rounded-2xl gradient-primary text-primary-foreground font-bold text-base shadow-glow disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {ar ? "جارٍ التحضير..." : "Preparing plan..."}
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              {ar ? "خطة الهجوم" : "Sales Attack Plan"}
            </>
          )}
        </button>

        {plan && (
          <div className="mt-6 space-y-4">
            {/* Diagnosis */}
            <Card icon={Target} title={ar ? "التشخيص" : "Diagnosis"}>
              <p className="text-sm leading-relaxed">{plan.diagnosis}</p>
            </Card>

            {/* Routine */}
            <Card icon={ShieldCheck} title={ar ? "الروتين المقترح" : "Recommended routine"}>
              <div className="space-y-2">
                {plan.routine.map((r) => (
                  <div key={r.step} className="rounded-xl bg-background/40 border border-border/60 p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-[10px] uppercase tracking-wider text-primary font-semibold">
                        {r.time} · {r.category}
                      </div>
                      <div className="text-xs font-bold">{r.priceEGP} EGP</div>
                    </div>
                    <div className="font-semibold text-sm mt-1">{r.product}</div>
                    <div className="text-[11px] text-muted-foreground">{r.brand}</div>
                    <div className="text-xs mt-1.5 text-muted-foreground leading-relaxed">{r.why}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Upsell */}
            {plan.upsell && (
              <Card icon={TrendingUp} title={ar ? "بيع إضافي" : "Upsell"}>
                <div className="font-semibold text-sm">{plan.upsell.product}</div>
                <div className="text-[11px] text-muted-foreground">{plan.upsell.brand}</div>
                <div className="text-xs mt-1.5 text-muted-foreground leading-relaxed">{plan.upsell.why}</div>
              </Card>
            )}

            {/* Objections */}
            <Card icon={MessageSquareQuote} title={ar ? "اعتراضات متوقعة" : "Expected objections"}>
              <div className="space-y-3">
                {plan.objections.map((o, i) => (
                  <div key={i}>
                    <div className="text-xs font-semibold text-orange-400">"{o.objection}"</div>
                    <div className="text-xs mt-1 leading-relaxed">{o.counter}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Closing line */}
            <div className="rounded-2xl gradient-primary p-4 shadow-glow">
              <div className="text-[10px] uppercase tracking-widest text-primary-foreground/80 font-bold">
                {ar ? "جملة الإغلاق" : "Closing line"}
              </div>
              <div className="text-base font-bold text-primary-foreground mt-1.5 leading-snug">
                {plan.closingLine}
              </div>
            </div>
          </div>
        )}

        <div className="h-20" />
      </MobileShell>
      <BottomNav />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mb-2 px-1">{title}</div>
      {children}
    </div>
  );
}

function Card({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}
