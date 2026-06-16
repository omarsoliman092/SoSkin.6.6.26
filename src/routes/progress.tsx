import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Camera, TrendingUp, TrendingDown, Lock, Crown } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { usePaywall } from "@/hooks/usePaywall";
import { PricingPaywallModal } from "@/components/PricingPaywallModal";
import { toast } from "sonner";

import { PremiumGate } from "@/components/PremiumGate";

export const Route = createFileRoute("/progress")({
  component: () => (
    <PremiumGate
      featureKey="progress"
      title="قبل وبعد / Personal Progress"
      subtitle="يرجى الترقية إلى النسخة الـ PRO للاستفادة من كافة ميزات S.O.SKIN الاحترافية."
      benefits={[
        "تتبع تقدم بشرتك بصور قبل/بعد",
        "تحليل AI لمؤشرات البشرة",
        "توصيات روتين مخصصة",
      ]}
    >
      <ProgressPage />
    </PremiumGate>
  ),
});

type Metric = { delta: number; note: string };
type R = {
  overallImprovement: number;
  metrics: Record<string, Metric>;
  summary: string; routineVerdict: string; nextSteps: string[];
};

const M_AR: Record<string,string> = { acne:"حبوب", redness:"احمرار", hydration:"ترطيب", brightness:"إشراق", texture:"ملمس", pores:"مسام" };
const M_EN: Record<string,string> = { acne:"Acne", redness:"Redness", hydration:"Hydration", brightness:"Brightness", texture:"Texture", pores:"Pores" };

async function fileToDataUrl(f: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(f);
  });
}

function ProgressPage() {
  const { profile } = useProfile();
  const ar = profile.lang === "ar";
  const { isPro, paywallOpen, openPaywall, closePaywall } = usePaywall();
  const [before, setBefore] = useState<string>("");
  const [after, setAfter] = useState<string>("");
  const [weeks, setWeeks] = useState<string>("");
  const [routine, setRoutine] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [r, setR] = useState<R | null>(null);

  const run = async () => {
    if (!isPro) { openPaywall(false); return; }
    if (!before || !after) return toast.error(ar ? "ارفع الصورتين" : "Upload both photos");
    setLoading(true); setR(null);
    try {
      const res = await fetch("/api/public/progress", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ before, after, weeks: Number(weeks) || undefined, routine, lang: ar ? "ar" : "en" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "fail");
      setR(data);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const L = ar ? M_AR : M_EN;

  return (
    <>
      <MobileShell>
        <header className="mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Camera className="w-6 h-6 text-primary" />
            {ar ? "قبل وبعد" : "Before & After"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ar ? "تتبع تطور بشرتك بتحليل AI" : "Track skin progress with AI analysis"}
          </p>
        </header>

        <div className="grid grid-cols-2 gap-2">
          {([
            ["before", before, setBefore, ar?"قبل":"Before"],
            ["after", after, setAfter, ar?"بعد":"After"],
          ] as const).map(([k, val, set, label]) => (
            <label key={k} className="aspect-[3/4] rounded-2xl border border-dashed border-border bg-card flex flex-col items-center justify-center cursor-pointer overflow-hidden relative">
              {val ? <img src={val} alt={label} className="absolute inset-0 w-full h-full object-cover" /> : (
                <>
                  <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden"
                onChange={async (e) => { const f = e.target.files?.[0]; if (f) set(await fileToDataUrl(f)); }} />
            </label>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <input value={weeks} onChange={(e)=>setWeeks(e.target.value)} inputMode="numeric"
            placeholder={ar ? "أسابيع" : "Weeks"}
            className="h-11 rounded-2xl bg-card border border-border px-4 text-sm outline-none focus:border-primary" />
          <input value={routine} onChange={(e)=>setRoutine(e.target.value)}
            placeholder={ar ? "روتينك (اختصار)" : "Routine (brief)"}
            className="h-11 rounded-2xl bg-card border border-border px-4 text-sm outline-none focus:border-primary" />
        </div>

        <button onClick={run} disabled={loading}
          className="w-full mt-2 h-12 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isPro ? <TrendingUp className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          {ar ? "حلّل التطور بالـ AI" : "Analyze progress with AI"}
          {!isPro && <Crown className="w-3.5 h-3.5 opacity-80" />}
        </button>
        {!isPro && (
          <p className="text-[10px] text-center text-muted-foreground mt-2 tracking-wider uppercase">
            {ar ? "تحليل الـ AI متاح فى SOSKIN PRO" : "AI analysis available in SOSKIN PRO"}
          </p>
        )}

        {r && (
          <div className="mt-5 space-y-3 animate-float-up">
            <div className="rounded-2xl gradient-aurora border border-primary/30 p-5 text-primary-foreground text-center">
              <div className="text-[10px] uppercase tracking-wider opacity-80">{ar ? "نسبة التحسن" : "Improvement"}</div>
              <div className="text-5xl font-bold mt-1">{r.overallImprovement}%</div>
              <div className="text-sm mt-2 italic">"{r.summary}"</div>
            </div>

            <div className="rounded-2xl border border-border bg-card divide-y divide-border">
              {Object.entries(r.metrics).map(([k, m]) => {
                const up = m.delta >= 0;
                return (
                  <div key={k} className="flex items-center gap-3 p-3">
                    <div className="text-xs w-20 shrink-0">{L[k]||k}</div>
                    <div className={`flex items-center gap-1 text-xs font-semibold w-14 shrink-0 ${up?"text-primary":"text-destructive"}`}>
                      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {up ? "+" : ""}{m.delta}
                    </div>
                    <div className="text-xs text-muted-foreground flex-1">{m.note}</div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-border gradient-card p-4">
              <div className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">{ar ? "تقييم الروتين" : "Routine verdict"}</div>
              <div className="text-sm">{r.routineVerdict}</div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{ar ? "خطوات تالية" : "Next steps"}</div>
              <ul className="space-y-1.5 text-sm">{r.nextSteps.map((s,i)=><li key={i} className="flex gap-2"><span className="text-primary">•</span>{s}</li>)}</ul>
            </div>
          </div>
        )}
      </MobileShell>
      <BottomNav />
      <PricingPaywallModal isOpen={paywallOpen} onClose={closePaywall} isExpertModel={false} />
    </>
  );
}
