import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, TrendingUp, RefreshCw } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

export const Route = createFileRoute("/trends")({
  head: () => ({
    meta: [
      { title: "Beauty Trends — SoSkin" },
      { name: "description", content: "What's trending right now in the Egyptian beauty and skincare market — curated by SoSkin." },
      { property: "og:title", content: "Beauty Trends — SoSkin" },
      { property: "og:description", content: "What's trending right now in the Egyptian beauty and skincare market — curated by SoSkin." },
    ],
  }),
  component: TrendsPage,
});


type Trend = {
  trend: string;
  platform: "TikTok" | "Instagram" | "Both";
  whatItIs: string;
  matchedProduct: string;
  salesAngle: string;
  heat: string;
};

function TrendsPage() {
  const { profile, ready } = useProfile();
  const ar = profile.lang === "ar";
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState<Trend[]>([]);

  const run = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/public/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: profile.lang }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Failed");
      setTrends(json.trends || []);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (ready) run(); /* eslint-disable-next-line */ }, [ready]);

  if (!ready) return null;

  return (
    <>
      <MobileShell>
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              {ar ? "تريندات السوشيال" : "Social Trend Tracker"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {ar ? "كل تريند فيرال + المنتج اللي يبيعه" : "Every viral trend + the product that sells it"}
            </p>
          </div>
          <button onClick={run} disabled={loading}
            className="p-2.5 rounded-xl bg-card border border-border hover:border-primary/50 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </button>
        </header>

        {loading && trends.length === 0 && (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border border-border bg-card/40 h-28 animate-pulse" />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-2">
          {trends.map((t, i) => (
            <div key={i} className="rounded-2xl border border-border gradient-card p-3.5 animate-float-up">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="min-w-0">
                  <div className="text-sm font-bold leading-tight">{t.trend}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{t.platform}</div>
                </div>
                <div className="text-base shrink-0">{t.heat}</div>
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed mb-2">{t.whatItIs}</div>
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-2.5 mb-1.5">
                <div className="text-[10px] uppercase tracking-wider text-primary mb-0.5">{ar ? "المنتج" : "Product"}</div>
                <div className="text-xs font-semibold">{t.matchedProduct}</div>
              </div>
              <div className="text-[11px] leading-relaxed">💬 {t.salesAngle}</div>
            </div>
          ))}
        </div>
      </MobileShell>
      <BottomNav />
    </>
  );
}
