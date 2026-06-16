import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Sun, Moon, CalendarDays, Sparkles } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { LayerTimer } from "@/components/LayerTimer";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

export const Route = createFileRoute("/builder")({ component: BuilderPage });

type Step = { step: number; type: string; product: string; brand: string; priceEGP: string; frequency: string; why: string };
type Result = {
  summary: string;
  am: Step[];
  pm: Step[];
  weekly: { day: string; action: string }[];
  totalCostEGP: string;
  introductionPlan: string[];
};

function BuilderPage() {
  const { profile, ready } = useProfile();
  const ar = profile.lang === "ar";
  const [level, setLevel] = useState<"starter" | "intermediate" | "advanced">("starter");
  const [skinCycling, setSkinCycling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  if (!ready) return null;

  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/public/builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skinType: profile.skinType,
          concerns: profile.concerns,
          budget: profile.budget,
          preference: profile.preference,
          sensitive: !!profile.allergies,
          pregnant: profile.pregnant,
          gender: profile.recommendFor,
          level,
          skinCycling,
          lang: ar ? "ar" : "en",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Builder failed");
      setResult(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MobileShell>
        <header className="mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            {ar ? "صمم روتينك" : "Routine Builder"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ar ? "AI يبنى روتين متدرج مناسب ليك" : "AI builds a gradual routine for you"}
          </p>
        </header>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {(["starter", "intermediate", "advanced"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`h-10 rounded-2xl text-xs font-semibold border ${
                level === l ? "gradient-primary text-primary-foreground border-primary shadow-glow" : "bg-card border-border text-muted-foreground"
              }`}
            >
              {ar
                ? l === "starter" ? "مبتدئ" : l === "intermediate" ? "متوسط" : "متقدم"
                : l[0].toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={() => setSkinCycling((v) => !v)}
          className={`w-full mb-3 h-10 rounded-2xl text-xs font-semibold border transition flex items-center justify-center gap-2 ${
            skinCycling
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground"
          }`}
        >
          <span className="text-base">🌙</span>
          {ar ? `Skin Cycling (دورة ٤ ليالٍ) ${skinCycling ? "✓" : ""}` : `Skin Cycling (4-night) ${skinCycling ? "✓" : ""}`}
        </button>

        <button
          onClick={run}
          disabled={loading}
          className="w-full h-12 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {ar ? "ابنى روتينى" : "Build my routine"}
        </button>

        {result && (
          <div className="mt-5 space-y-4 animate-float-up">
            <div className="rounded-2xl gradient-aurora border border-primary/30 p-4 text-primary-foreground">
              <div className="text-[10px] uppercase tracking-wider opacity-80">{ar ? "فلسفة الروتين" : "Philosophy"}</div>
              <div className="text-sm mt-1">{result.summary}</div>
              <div className="text-xs mt-2 opacity-90">{ar ? "تكلفة شهرية تقريبية" : "Approx monthly cost"}: <b>{result.totalCostEGP}</b></div>
            </div>

            <RoutineBlock icon={Sun} title={ar ? "روتين الصباح" : "Morning routine"} steps={result.am} ar={ar} />
            <RoutineBlock icon={Moon} title={ar ? "روتين الليل" : "Night routine"} steps={result.pm} ar={ar} />

            {result.weekly?.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-xs font-semibold text-muted-foreground mb-2">{ar ? "إضافات أسبوعية" : "Weekly extras"}</div>
                <ul className="space-y-1.5 text-sm">
                  {result.weekly.map((w, i) => (
                    <li key={i} className="flex gap-2"><span className="text-primary font-semibold w-16 shrink-0">{w.day}</span><span>{w.action}</span></li>
                  ))}
                </ul>
              </div>
            )}

            {result.introductionPlan?.length > 0 && (
              <div className="rounded-2xl border border-primary/30 gradient-card p-4">
                <div className="text-xs font-semibold text-primary mb-2">{ar ? "خطة الإدخال التدريجى" : "Gradual introduction plan"}</div>
                <ol className="space-y-1.5 text-sm list-decimal ps-5">
                  {result.introductionPlan.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </MobileShell>
      <BottomNav />
    </>
  );
}

function RoutineBlock({ icon: Icon, title, steps, ar }: { icon: any; title: string; steps: Step[]; ar: boolean }) {
  return (
    <div className="rounded-2xl border border-border gradient-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <div className="space-y-2">
        {steps.map((s, idx) => (
          <div key={s.step}>
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                {s.step}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold leading-tight">{s.product}</div>
                <div className="text-xs text-muted-foreground">{s.brand} • {s.priceEGP} • {s.frequency}</div>
                <div className="text-xs mt-1 leading-relaxed">{s.why}</div>
              </div>
            </div>
            {idx < steps.length - 1 && <LayerTimer ar={ar} />}
          </div>
        ))}
      </div>
    </div>
  );
}
