import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, AlertTriangle, Stethoscope, ShieldAlert } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { usePaywall } from "@/hooks/usePaywall";
import { FeatureLockScreen } from "@/components/FeatureLockScreen";
import { toast } from "sonner";

export const Route = createFileRoute("/sos")({
  head: () => ({
    meta: [
      { title: "SOS Rescue — SoSkin" },
      { name: "description", content: "Instant AI-powered rescue for urgent skin problems — describe what's wrong and get a tailored action plan." },
      { property: "og:title", content: "SOS Rescue — SoSkin" },
      { property: "og:description", content: "Instant AI-powered rescue for urgent skin problems — describe what's wrong and get a tailored action plan." },
    ],
  }),
  component: SosPage,
});


type Result = {
  severity: "mild" | "moderate" | "severe";
  seeDoctor: boolean;
  reassurance: string;
  stopUsing: string[];
  emergencySteps: { step: number; action: string }[];
  safeProducts: { name: string; brand: string; why: string; priceEGP: string }[];
  avoidActives: string[];
  whenBetter: string;
};

const SYMPTOMS = [
  { id: "irritation", ar: "تهيج", en: "Irritation" },
  { id: "allergy", ar: "حساسية", en: "Allergy" },
  { id: "burn", ar: "حروق", en: "Burn" },
  { id: "barrier", ar: "حاجز تالف", en: "Damaged barrier" },
  { id: "acne_flare", ar: "ثوران حبوب", en: "Acne flare" },
  { id: "redness", ar: "احمرار", en: "Redness" },
  { id: "other", ar: "أخرى", en: "Other" },
] as const;

const SEV_COLOR = {
  mild: "bg-primary/20 text-primary",
  moderate: "bg-accent/30 text-accent-foreground",
  severe: "bg-destructive/20 text-destructive",
};

function SosPage() {
  const { profile, ready } = useProfile();
  const ar = profile.lang === "ar";
  const [symptom, setSymptom] = useState<typeof SYMPTOMS[number]["id"]>("irritation");
  const [description, setDescription] = useState("");
  const [products, setProducts] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const { isPro } = usePaywall();

  if (!ready) return null;

  if (!isPro) {
    return (
      <>
        <MobileShell>
          <header className="mb-2">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-destructive" />
              {ar ? "إسعاف بشرة" : "Skin SOS"}
            </h1>
          </header>
          <FeatureLockScreen
            ar={ar}
            title={ar ? "بروتوكول الإنقاذ السريع SOS" : "SOS 48h Rescue Protocol"}
            subtitle={
              ar
                ? "خطة طوارئ ذكية لإنقاذ بشرتك خلال 48 ساعة فقط — حصرياً لمشتركى SOSKIN PRO."
                : "Smart 48-hour emergency protocol to rescue your skin — exclusive to SOSKIN PRO."
            }
            benefits={
              ar
                ? [
                    "تشخيص فورى لشدة الأزمة (خفيف / متوسط / حاد)",
                    "خطوات إسعاف مكتوبة لأول 48 ساعة",
                    "قائمة مكونات يجب إيقافها فوراً",
                    "بدائل آمنة وموثوقة من السوق المصرى",
                  ]
                : [
                    "Instant severity diagnosis (mild / moderate / severe)",
                    "Step-by-step 48-hour rescue plan",
                    "Ingredients to stop using immediately",
                    "Safe alternatives from the Egyptian market",
                  ]
            }
          />
        </MobileShell>
        <BottomNav />
      </>
    );
  }

  const run = async () => {
    if (!description.trim()) {
      toast.error(ar ? "اوصف اللى بيحصل" : "Describe what's happening");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const currentProducts = products.split(/[,،\n]/).map((s) => s.trim()).filter(Boolean);
      const res = await fetch("/api/public/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptom,
          description,
          currentProducts,
          pregnant: profile.pregnant,
          lang: ar ? "ar" : "en",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "SOS failed");
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
            <ShieldAlert className="w-6 h-6 text-destructive" />
            {ar ? "إسعاف بشرة" : "Skin SOS"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ar ? "إرشاد فورى وقت أزمة بشرتك" : "Instant guidance when your skin is in trouble"}
          </p>
        </header>

        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-1.5">
            {SYMPTOMS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSymptom(s.id)}
                className={`h-10 rounded-2xl text-xs font-medium border ${
                  symptom === s.id ? "gradient-primary text-primary-foreground border-primary shadow-glow" : "bg-card border-border text-muted-foreground"
                }`}
              >
                {ar ? s.ar : s.en}
              </button>
            ))}
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={ar ? "اوصف الأعراض بالتفصيل..." : "Describe the symptoms in detail..."}
            rows={4}
            className="w-full rounded-2xl bg-card border border-border px-4 py-3 text-sm outline-none focus:border-primary resize-none"
          />

          <input
            value={products}
            onChange={(e) => setProducts(e.target.value)}
            placeholder={ar ? "منتجاتك الحالية (افصلهم بفاصلة)" : "Current products (comma separated)"}
            className="w-full h-11 rounded-2xl bg-card border border-border px-4 text-sm outline-none focus:border-primary"
          />

          <button
            onClick={run}
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-destructive text-destructive-foreground font-semibold shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
            {ar ? "أنقذ بشرتى" : "Rescue my skin"}
          </button>
        </div>

        {result && (
          <div className="mt-5 space-y-3 animate-float-up">
            <div className="rounded-2xl border border-border gradient-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${SEV_COLOR[result.severity]}`}>
                  {result.severity}
                </span>
                {result.seeDoctor && (
                  <span className="flex items-center gap-1 text-xs text-destructive font-semibold">
                    <Stethoscope className="w-3 h-3" /> {ar ? "اذهب للطبيب" : "See a doctor"}
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed">{result.reassurance}</p>
            </div>

            {result.stopUsing?.length > 0 && (
              <Block title={ar ? "أوقف فوراً" : "Stop immediately"} color="destructive">
                <ul className="space-y-1 text-sm">
                  {result.stopUsing.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </Block>
            )}

            {result.emergencySteps?.length > 0 && (
              <Block title={ar ? "خطوات الـ 48 ساعة" : "Next 48h steps"}>
                <ol className="space-y-2 text-sm">
                  {result.emergencySteps.map((s) => (
                    <li key={s.step} className="flex gap-2">
                      <span className="w-6 h-6 rounded-full gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">{s.step}</span>
                      <span className="flex-1 leading-relaxed">{s.action}</span>
                    </li>
                  ))}
                </ol>
              </Block>
            )}

            {result.safeProducts?.length > 0 && (
              <Block title={ar ? "منتجات آمنة" : "Safe rescue products"}>
                <div className="space-y-2">
                  {result.safeProducts.map((p, i) => (
                    <div key={i} className="text-sm">
                      <div className="font-semibold">{p.name} <span className="text-muted-foreground font-normal">— {p.brand} • {p.priceEGP}</span></div>
                      <div className="text-xs text-muted-foreground">{p.why}</div>
                    </div>
                  ))}
                </div>
              </Block>
            )}

            {result.avoidActives?.length > 0 && (
              <Block title={ar ? "مكونات تجنبها" : "Avoid these actives"}>
                <div className="flex flex-wrap gap-1.5">
                  {result.avoidActives.map((a, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-full bg-destructive/15 text-destructive font-medium">{a}</span>
                  ))}
                </div>
              </Block>
            )}

            <Block title={ar ? "متى تشوف تحسن" : "When you'll see improvement"}>
              <p className="text-sm leading-relaxed">{result.whenBetter}</p>
            </Block>
          </div>
        )}
      </MobileShell>
      <BottomNav />
    </>
  );
}

function Block({ title, children, color }: { title: string; children: React.ReactNode; color?: "destructive" }) {
  return (
    <div className={`rounded-2xl border p-4 ${color === "destructive" ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"}`}>
      <div className={`text-xs font-semibold mb-2 ${color === "destructive" ? "text-destructive" : "text-muted-foreground"}`}>{title}</div>
      {children}
    </div>
  );
}
