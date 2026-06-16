import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { PremiumGate } from "@/components/PremiumGate";
import { AlertTriangle, CheckCircle2, Sun, Moon, Sparkles, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/conflicts")({
  component: () => (
    <PremiumGate
      featureKey="conflicts"
      title="كاشف تعارضات المكونات / Ingredient Conflicts"
      subtitle="يرجى الترقية إلى النسخة الـ PRO للاستفادة من كافة ميزات S.O.SKIN الاحترافية."
      benefits={[
        "تحليل متقدم لتعارضات المكونات",
        "حلول عملية وجدول AM/PM آمن",
        "تجنّب التهيج والاحمرار",
      ]}
    >
      <ConflictsPage />
    </PremiumGate>
  ),
});

const STORAGE_KEY = "soskin.routine.v1";

interface Conflict {
  between: string[];
  ingredient: string;
  severity: "low" | "medium" | "high";
  reason: string;
  fix: string;
}
interface Result {
  summary: string;
  conflicts: Conflict[];
  safeCombos?: { products: string[]; note: string }[];
  schedule?: { AM: string[]; PM: string[]; notes: string };
}

function ConflictsPage() {
  const { profile, ready } = useProfile();
  const ar = profile.lang === "ar";
  const [products, setProducts] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const v = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const all = [...(v.AM || []), ...(v.PM || [])];
      if (all.length) setProducts(Array.from(new Set(all)));
    } catch {}
  }, []);

  const add = () => {
    const v = input.trim();
    if (!v) return;
    if (products.length >= 20) return;
    setProducts([...products, v]);
    setInput("");
  };

  const analyze = async () => {
    if (products.length < 2) {
      toast.error(ar ? "أضف منتجين على الأقل" : "Add at least 2 products");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch("/api/public/conflicts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products,
          lang: profile.lang,
          skinType: profile.skinType,
          pregnant: profile.pregnant,
        }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Failed");
      setResult(json);
    } catch (e: any) {
      toast.error(e.message || (ar ? "حدث خطأ" : "Error"));
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return null;

  const sevColor = (s: string) =>
    s === "high"
      ? "border-destructive/50 bg-destructive/10 text-destructive"
      : s === "medium"
      ? "border-amber-500/50 bg-amber-500/10 text-amber-500"
      : "border-yellow-500/40 bg-yellow-500/10 text-yellow-600";

  return (
    <>
      <MobileShell>
        <h1 className="text-2xl font-bold mb-1">{ar ? "تعارض المكوّنات" : "Ingredient Conflicts"}</h1>
        <p className="text-sm text-muted-foreground mb-5">
          {ar ? "اعرف إيه اللي ينفع يتجمع وإيه اللي لأ" : "Know what mixes and what doesn't"}
        </p>

        <div className="flex gap-2 mb-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder={ar ? "اسم المنتج..." : "Product name..."}
            className="flex-1 px-4 py-3 rounded-2xl bg-card border border-border text-sm"
          />
          <button onClick={add} className="px-4 rounded-2xl gradient-primary text-primary-foreground">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {products.map((p, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs">
              {p}
              <button onClick={() => setProducts(products.filter((_, x) => x !== i))} className="text-muted-foreground">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <button
          onClick={analyze}
          disabled={loading || products.length < 2}
          className="w-full h-12 rounded-2xl gradient-aurora text-primary-foreground font-semibold text-sm shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {ar ? "حلل بالذكاء الاصطناعي" : "Analyze with AI"}
        </button>

        {result && (
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-2xl gradient-card border border-border">
              <div className="text-xs text-muted-foreground mb-1">{ar ? "الخلاصة" : "Summary"}</div>
              <div className="text-sm">{result.summary}</div>
            </div>

            {result.conflicts?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  {ar ? "تعارضات" : "Conflicts"} ({result.conflicts.length})
                </h3>
                <div className="space-y-2">
                  {result.conflicts.map((c, i) => (
                    <div key={i} className={`p-3 rounded-2xl border ${sevColor(c.severity)}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs font-bold uppercase">{c.severity}</div>
                        <div className="text-xs opacity-80">{c.ingredient}</div>
                      </div>
                      <div className="text-sm font-medium text-foreground">{c.between.join(" ↔ ")}</div>
                      <div className="text-xs text-muted-foreground mt-1">{c.reason}</div>
                      <div className="text-xs mt-2 p-2 rounded-lg bg-background/50 text-foreground">
                        💡 {c.fix}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.safeCombos && result.safeCombos.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {ar ? "مزيج آمن" : "Safe Combos"}
                </h3>
                <div className="space-y-2">
                  {result.safeCombos.map((s, i) => (
                    <div key={i} className="p-3 rounded-2xl border border-green-500/30 bg-green-500/10">
                      <div className="text-sm font-medium">{s.products.join(" + ")}</div>
                      <div className="text-xs text-muted-foreground mt-1">{s.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.schedule && (
              <div className="p-4 rounded-2xl gradient-card border border-border">
                <h3 className="text-sm font-semibold mb-3">{ar ? "الجدول المقترح" : "Suggested Schedule"}</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <Sun className="w-3.5 h-3.5" /> {ar ? "صباحاً" : "AM"}
                    </div>
                    <ol className="space-y-1 text-xs">
                      {result.schedule.AM.map((p, i) => <li key={i}>{i + 1}. {p}</li>)}
                    </ol>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <Moon className="w-3.5 h-3.5" /> {ar ? "مساءً" : "PM"}
                    </div>
                    <ol className="space-y-1 text-xs">
                      {result.schedule.PM.map((p, i) => <li key={i}>{i + 1}. {p}</li>)}
                    </ol>
                  </div>
                </div>
                {result.schedule.notes && (
                  <div className="text-xs text-muted-foreground border-t border-border pt-2">{result.schedule.notes}</div>
                )}
              </div>
            )}

            <Link to="/builder" className="block text-center text-xs text-muted-foreground underline">
              {ar ? "افتح Routine Builder" : "Open Routine Builder"}
            </Link>
          </div>
        )}
      </MobileShell>
      <BottomNav />
    </>
  );
}
