import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Shield, Search } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { PremiumGate } from "@/components/PremiumGate";
import { toast } from "sonner";

export const Route = createFileRoute("/objections")({
  component: () => (
    <PremiumGate
      featureKey="objections"
      isExpert
      title="الاعتراضات الطبية / Objection Scripts"
      subtitle="يرجى الترقية إلى النسخة الـ PRO للاستفادة من كافة ميزات S.O.SKIN الاحترافية."
      benefits={[
        "ردود طبية احترافية على اعتراضات العملاء",
        "سكريبتات جاهزة للاستخدام الفوري",
        "محدثة باستمرار وفق أحدث الأبحاث",
      ]}
    >
      <ObjectionsPage />
    </PremiumGate>
  ),
});

type Result = { reframe: string; scripts: string[]; proofPoint: string; fallback: string };

const COMMON_AR = [
  "غالي أوي",
  "هاخده بكره",
  "بستخدم منتج تاني",
  "مش متأكدة من النتيجة",
  "ممكن أرخص؟",
  "هسأل جوزي/أمي",
];
const COMMON_EN = [
  "Too expensive",
  "I'll come back later",
  "Already using something",
  "Not sure it'll work",
  "Got anything cheaper?",
  "Need to ask first",
];

function ObjectionsPage() {
  const { profile, ready } = useProfile();
  const ar = profile.lang === "ar";
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Result | null>(null);

  if (!ready) return null;

  const run = async (term?: string) => {
    const v = (term ?? q).trim();
    if (v.length < 2) { toast.error(ar ? "اكتب الاعتراض" : "Type the objection"); return; }
    setLoading(true); setData(null);
    try {
      const r = await fetch("/api/public/objection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objection: v, lang: profile.lang }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Failed");
      setData(json);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const common = ar ? COMMON_AR : COMMON_EN;

  return (
    <>
      <MobileShell>
        <header className="mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            {ar ? "كروت الاعتراضات" : "Objection Cards"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ar ? "ردود جاهزة لأي اعتراض من العميل" : "Ready-to-say replies to any customer objection"}
          </p>
        </header>

        <div className="flex gap-2 mb-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder={ar ? "اكتب اعتراض العميل..." : "Type customer objection..."}
            className="flex-1 px-4 py-3 rounded-2xl bg-card border border-border text-sm"
          />
          <button onClick={() => run()} disabled={loading}
            className="px-4 rounded-2xl gradient-primary text-primary-foreground shadow-glow disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {common.map((c) => (
            <button key={c} onClick={() => { setQ(c); run(c); }}
              className="text-[11px] px-2.5 py-1 rounded-full bg-card border border-border hover:border-primary/50">
              {c}
            </button>
          ))}
        </div>

        {data && (
          <div className="space-y-3 animate-float-up">
            <div className="rounded-2xl gradient-aurora border border-primary/30 p-4 text-primary-foreground">
              <div className="text-[10px] uppercase tracking-wider opacity-80 mb-1">{ar ? "إعادة التأطير" : "Reframe"}</div>
              <div className="text-sm font-semibold">{data.reframe}</div>
            </div>

            <div className="space-y-2">
              {data.scripts?.map((s, i) => (
                <div key={i} className="rounded-2xl border border-border gradient-card p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    {ar ? `سيناريو ${i + 1}` : `Script ${i + 1}`}
                  </div>
                  <div className="text-sm leading-relaxed">{s}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-3">
              <div className="text-[10px] uppercase tracking-wider text-green-500 mb-1">{ar ? "نقطة الإقناع" : "Proof point"}</div>
              <div className="text-xs">{data.proofPoint}</div>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3">
              <div className="text-[10px] uppercase tracking-wider text-amber-500 mb-1">{ar ? "البديل الأرخص" : "Cheaper fallback"}</div>
              <div className="text-xs">{data.fallback}</div>
            </div>
          </div>
        )}
      </MobileShell>
      <BottomNav />
    </>
  );
}
