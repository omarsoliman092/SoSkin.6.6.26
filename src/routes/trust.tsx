import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, ShieldCheck, Star, MapPin } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

export const Route = createFileRoute("/trust")({ component: TrustPage });

type R = {
  product: string; brand: string; overall: number;
  scores: Record<string, number>;
  verdict: string; strengths: string[]; weaknesses: string[];
  bestFor: string[]; avoidIf: string[];
  egyptAvailability: { available: boolean; where: string[]; priceEGP: string };
};

const LABELS_AR: Record<string,string> = {
  ingredientQuality: "جودة المكونات", formulation: "قوة التركيبة", scientificSupport: "دعم علمى",
  marketingHonesty: "صدق التسويق", valueForMoney: "القيمة مقابل السعر",
  irritationRisk: "خطر التهيج", skinCompatibility: "توافق البشرة",
};
const LABELS_EN: Record<string,string> = {
  ingredientQuality: "Ingredient Quality", formulation: "Formulation", scientificSupport: "Science",
  marketingHonesty: "Marketing Honesty", valueForMoney: "Value",
  irritationRisk: "Irritation Risk", skinCompatibility: "Skin Fit",
};

function TrustPage() {
  const { profile } = useProfile();
  const ar = profile.lang === "ar";
  const [product, setProduct] = useState("");
  const [loading, setLoading] = useState(false);
  const [r, setR] = useState<R | null>(null);

  const run = async () => {
    if (!product.trim()) return toast.error(ar ? "اكتب اسم المنتج" : "Enter product name");
    setLoading(true); setR(null);
    try {
      const res = await fetch("/api/public/trust", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, lang: ar ? "ar" : "en" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "fail");
      setR(data);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const L = ar ? LABELS_AR : LABELS_EN;

  return (
    <>
      <MobileShell>
        <header className="mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            {ar ? "Trust Score" : "Trust Score"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ar ? "تقييم SoSkin الذكى للمنتج" : "SoSkin's intelligent product rating"}
          </p>
        </header>

        <div className="flex gap-2">
          <input
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder={ar ? "اسم المنتج (مثال: CeraVe Foaming)" : "Product name"}
            className="flex-1 h-11 rounded-2xl bg-card border border-border px-4 text-sm outline-none focus:border-primary"
          />
          <button
            onClick={run} disabled={loading}
            className="h-11 px-5 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
            {ar ? "قيّم" : "Rate"}
          </button>
        </div>

        {r && (
          <div className="mt-5 space-y-3 animate-float-up">
            <div className="rounded-2xl gradient-aurora border border-primary/30 p-5 text-primary-foreground">
              <div className="text-[10px] uppercase tracking-wider opacity-80">{ar ? "النتيجة الكلية" : "Overall"}</div>
              <div className="flex items-end justify-between mt-1">
                <div>
                  <div className="font-bold text-lg leading-tight">{r.product}</div>
                  <div className="text-xs opacity-90">{r.brand}</div>
                </div>
                <div className="text-4xl font-bold">{r.overall}<span className="text-base opacity-70">/100</span></div>
              </div>
              <div className="text-sm mt-3 italic">"{r.verdict}"</div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
              {Object.entries(r.scores).map(([k, v]) => (
                <div key={k}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{L[k] || k}</span>
                    <span className="font-semibold">{v}/100</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${v}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-border bg-card p-3">
                <div className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-2">{ar ? "نقاط القوة" : "Strengths"}</div>
                <ul className="space-y-1 text-xs">{r.strengths.map((s,i)=><li key={i}>• {s}</li>)}</ul>
              </div>
              <div className="rounded-2xl border border-border bg-card p-3">
                <div className="text-[10px] font-semibold text-destructive uppercase tracking-wider mb-2">{ar ? "نقاط ضعف" : "Weaknesses"}</div>
                <ul className="space-y-1 text-xs">{r.weaknesses.map((s,i)=><li key={i}>• {s}</li>)}</ul>
              </div>
            </div>

            <div className="rounded-2xl border border-border gradient-card p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-2">
                <MapPin className="w-3.5 h-3.5" /> {ar ? "التوفر فى مصر" : "Egypt availability"}
              </div>
              <div className="text-sm">
                {r.egyptAvailability.available ? (ar ? "متوفر" : "Available") : (ar ? "محدود" : "Limited")} • {r.egyptAvailability.priceEGP}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {r.egyptAvailability.where.map((w,i)=>(
                  <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary">{w}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-2xl border border-border bg-card p-3">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">{ar ? "مناسب لـ" : "Best for"}</div>
                <div>{r.bestFor.join(" • ")}</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-3">
                <div className="text-[10px] font-semibold text-destructive uppercase mb-1">{ar ? "تجنبه إذا" : "Avoid if"}</div>
                <div>{r.avoidIf.join(" • ")}</div>
              </div>
            </div>
          </div>
        )}
      </MobileShell>
      <BottomNav />
    </>
  );
}
