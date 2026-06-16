import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, GraduationCap, Search, Sparkles } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

export const Route = createFileRoute("/university")({ component: UniversityPage });

type Result = {
  name: string;
  shortDef: string;
  bestFor: string[];
  avoidIf: string[];
  pairsWith: string[];
  conflictsWith: string[];
  myth: string;
  truth: string;
  egyptianTip: string;
};

const POPULAR = ["Niacinamide", "Retinol", "Vitamin C", "Salicylic Acid", "Hyaluronic Acid", "AHA", "Azelaic Acid", "Peptides"];

function UniversityPage() {
  const { profile, ready } = useProfile();
  const ar = profile.lang === "ar";
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Result | null>(null);

  if (!ready) return null;

  const run = async (term?: string) => {
    const v = (term ?? q).trim();
    if (v.length < 2) { toast.error(ar ? "اكتب اسم مكوّن" : "Type an ingredient"); return; }
    setLoading(true); setData(null);
    try {
      const r = await fetch("/api/public/university", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredient: v, lang: profile.lang }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Failed");
      setData(json);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <MobileShell>
        <header className="mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            {ar ? "قاموس المواد الفعّالة" : "Active Ingredients Dictionary"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ar ? "افهم أي مادة فعّالة في ٣٠ ثانية" : "Understand any active ingredient in 30s"}
          </p>
        </header>


        <div className="flex gap-2 mb-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder={ar ? "مثال: Retinol" : "e.g. Retinol"}
            className="flex-1 px-4 py-3 rounded-2xl bg-card border border-border text-sm"
          />
          <button onClick={() => run()} disabled={loading}
            className="px-4 rounded-2xl gradient-primary text-primary-foreground shadow-glow disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {POPULAR.map((p) => (
            <button key={p} onClick={() => { setQ(p); run(p); }}
              className="text-[11px] px-2.5 py-1 rounded-full bg-card border border-border hover:border-primary/50">
              {p}
            </button>
          ))}
        </div>

        {!data && !loading && (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center text-xs text-muted-foreground">
            <Sparkles className="w-5 h-5 mx-auto mb-2 text-primary" />
            {ar ? "اضغط على مكوّن أو اكتب اسمه" : "Tap a chip or type a name"}
          </div>
        )}

        {data && (
          <div className="space-y-3 animate-float-up">
            <div className="rounded-2xl gradient-aurora border border-primary/30 p-4 text-primary-foreground">
              <div className="text-[10px] uppercase tracking-wider opacity-80">{ar ? "مكوّن" : "Ingredient"}</div>
              <div className="text-lg font-bold mt-1">{data.name}</div>
              <div className="text-xs opacity-90 mt-1.5">{data.shortDef}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Block title={ar ? "✅ مناسب لـ" : "✅ Best for"} items={data.bestFor} tone="ok" />
              <Block title={ar ? "⚠️ تجنّب لو" : "⚠️ Avoid if"} items={data.avoidIf} tone="warn" />
              <Block title={ar ? "🤝 يتوافق مع" : "🤝 Pairs with"} items={data.pairsWith} tone="ok" />
              <Block title={ar ? "❌ يتعارض مع" : "❌ Clashes with"} items={data.conflictsWith} tone="warn" />
            </div>

            <div className="rounded-2xl border border-border gradient-card p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{ar ? "خرافة" : "Myth"}</div>
              <div className="text-xs line-through opacity-70">{data.myth}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-2 mb-1">{ar ? "الحقيقة" : "Truth"}</div>
              <div className="text-xs font-medium">{data.truth}</div>
            </div>

            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3 text-xs">
              🇪🇬 {data.egyptianTip}
            </div>
          </div>
        )}
      </MobileShell>
      <BottomNav />
    </>
  );
}

function Block({ title, items, tone }: { title: string; items: string[]; tone: "ok" | "warn" }) {
  const color = tone === "ok" ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5";
  return (
    <div className={`rounded-2xl border ${color} p-3`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">{title}</div>
      <div className="flex flex-wrap gap-1">
        {items?.length ? items.map((it, i) => (
          <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-background/60 border border-border">{it}</span>
        )) : <span className="text-[11px] text-muted-foreground">—</span>}
      </div>
    </div>
  );
}
