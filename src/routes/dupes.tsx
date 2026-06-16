import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Sparkles, Copy, Search } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { usePaywall } from "@/hooks/usePaywall";
import { FeatureLockScreen } from "@/components/FeatureLockScreen";
import { toast } from "sonner";

import { PremiumGate } from "@/components/PremiumGate";

export const Route = createFileRoute("/dupes")({
  component: () => (
    <PremiumGate
      featureKey="dupes"
      title="كاشف البدائل الذكي / Smart Dupe Finder"
      subtitle="يرجى الترقية إلى النسخة الـ PRO للاستفادة من كافة ميزات S.O.SKIN الاحترافية."
      benefits={[
        "بدائل اقتصادية بنفس الفعالية",
        "مقارنة مكونات وأسعار",
        "توفير حتى 70% من تكلفة الروتين",
      ]}
    >
      <DupesPage />
    </PremiumGate>
  ),
});

type Dupe = {
  name: string;
  brand: string;
  priceEGP: string;
  similarity: number;
  whyMatch: string;
  tradeoff: string;
};
type Result = {
  original: { name: string; estPriceEGP: string; keyActives: string[] };
  dupes: Dupe[];
  verdict: string;
};

function DupesPage() {
  const { profile, ready } = useProfile();
  const ar = profile.lang === "ar";
  const { isPro } = usePaywall();
  const [product, setProduct] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  if (!ready) return null;

  if (!isPro) {
    return (
      <>
        <MobileShell>
          <header className="mb-2">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              {ar ? "بدائل" : "Smart Dupes"}
            </h1>
          </header>
          <FeatureLockScreen
            ar={ar}
            isExpert
            title={ar ? "كاشف البدائل الذكى" : "Smart Dupe Finder"}
            subtitle={
              ar
                ? "لما المنتج الأصلى غالى أو ناقص — لقّى بدائل مطابقة بنفس المكونات الفعّالة."
                : "When the original is too expensive or out of stock — find dupes with the same key actives."
            }
            benefits={
              ar
                ? [
                    "بدائل مرتبة من الأغلى للأرخص",
                    "نسبة تطابق فى المكونات الفعّالة",
                    "مفاضلة واضحة بين كل بديل",
                    "منتجات متوفرة فعلاً فى السوق المصرى",
                  ]
                : [
                    "Dupes ranked by price",
                    "Active-ingredient match percentage",
                    "Clear trade-offs for each option",
                    "Real products available in Egypt",
                  ]
            }
          />
        </MobileShell>
        <BottomNav />
      </>
    );
  }


  const run = async () => {
    const v = product.trim();
    if (v.length < 2) {
      toast.error(ar ? "اكتب اسم منتج" : "Type a product name");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch("/api/public/dupes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: v,
          lang: profile.lang,
          budget: profile.budget,
          preference: profile.preference,
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

  const simColor = (s: number) =>
    s >= 85 ? "text-green-500" : s >= 70 ? "text-amber-500" : "text-muted-foreground";

  return (
    <>
      <MobileShell>
        <header className="mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Copy className="w-6 h-6 text-primary" />
            {ar ? "بدائل" : "Alternatives"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ar
              ? "أشهر بدائل السوق المصري — من الأغلى للأرخص"
              : "Most popular Egyptian-market alternatives — priciest to cheapest"}
          </p>
        </header>

        <div className="flex gap-2 mb-3">
          <input
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder={ar ? "مثال: The Ordinary Niacinamide 10%" : "e.g. The Ordinary Niacinamide 10%"}
            className="flex-1 px-4 py-3 rounded-2xl bg-card border border-border text-sm"
          />
          <button
            onClick={run}
            disabled={loading}
            className="px-4 rounded-2xl gradient-primary text-primary-foreground shadow-glow disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
        </div>

        {!result && !loading && (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center text-xs text-muted-foreground">
            <Sparkles className="w-5 h-5 mx-auto mb-2 text-primary" />
            {ar
              ? "اكتب اسم منتج وهنطلعلك ٤-٦ بدائل بنفس المكوّن الفعّال"
              : "Type a product and we'll surface 4-6 dupes with the same active"}
          </div>
        )}

        {result && (
          <div className="mt-2 space-y-3 animate-float-up">
            <div className="rounded-2xl gradient-aurora border border-primary/30 p-4 text-primary-foreground">
              <div className="text-[10px] uppercase tracking-wider opacity-80">
                {ar ? "المنتج الأصلي" : "Original"}
              </div>
              <div className="text-sm font-bold mt-1">{result.original.name}</div>
              <div className="text-xs opacity-90 mt-1">
                ~ {result.original.estPriceEGP} • {result.original.keyActives.join(" · ")}
              </div>
            </div>

            <div className="space-y-2">
              {result.dupes.map((d, i) => (
                <div key={i} className="rounded-2xl border border-border gradient-card p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold leading-tight truncate">{d.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {d.brand} • {d.priceEGP}
                      </div>
                    </div>
                    <div className={`text-sm font-bold tabular-nums ${simColor(d.similarity)}`}>
                      {d.similarity}%
                    </div>
                  </div>
                  <div className="text-xs mt-2 leading-relaxed">{d.whyMatch}</div>
                  {d.tradeoff && (
                    <div className="text-[11px] text-muted-foreground mt-1.5 border-t border-border pt-1.5">
                      ⚖️ {d.tradeoff}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {result.verdict && (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3 text-xs">
                💡 {result.verdict}
              </div>
            )}
          </div>
        )}
      </MobileShell>
      <BottomNav />
    </>
  );
}
