import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  Camera,
  Loader2,
  ShoppingBag,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Wallet,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/decide")({ component: DecidePage });

const DECIDE_URL = "/api/public/decide";

type Verdict = "suitable" | "caution" | "not_suitable";

interface Conflict {
  ingredient: string;
  conflictsWith: string;
  severity: "low" | "medium" | "high";
  note: string;
}
interface Alternative {
  name: string;
  brand: string;
  whyBetter: string;
  priceEGP: string;
}
interface Decision {
  productName: string;
  verdict: Verdict;
  matchScore: number;
  summary: string;
  reasons: string[];
  ingredientConflicts: Conflict[];
  alternatives: Alternative[];
  estimatedSavingsEGP: string;
  buyDecision: string;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function DecidePage() {
  const { profile, ready } = useProfile();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const ar = profile.lang === "ar";

  const [preview, setPreview] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [routineText, setRoutineText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Decision | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!ready) return null;

  if (!isAuthenticated) {
    return (
      <>
        <MobileShell>
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="w-14 h-14 rounded-2xl gradient-aurora flex items-center justify-center mb-4">
              <ShoppingBag className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">
              {ar ? "سجّل الدخول لاستخدام \"قبل ما تشتري\"" : "Sign in to use Before You Buy"}
            </h2>
            <button
              onClick={() => navigate({ to: "/login" })}
              className="h-11 px-5 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow text-sm mt-3"
            >
              {ar ? "تسجيل الدخول" : "Sign in"}
            </button>
          </div>
        </MobileShell>
        <BottomNav />
      </>
    );
  }

  const onPick = async (f: File) => {
    setResult(null);
    const dataUrl = await fileToDataUrl(f);
    setPreview(dataUrl);
    setImageDataUrl(dataUrl);
  };

  const clearImage = () => {
    setPreview(null);
    setImageDataUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const decide = async () => {
    if (!imageDataUrl && !productName.trim()) {
      toast.error(ar ? "صور المنتج أو اكتب اسمه" : "Add a photo or type the product name");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const currentRoutine = routineText
        .split(/[\n,،]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch(DECIDE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageDataUrl ?? undefined,
          productName: productName.trim() || undefined,
          currentRoutine,
          lang: ar ? "ar" : "en",
          profile: {
            name: profile.name,
            gender: profile.gender,
            recommendFor: profile.recommendFor,
            skinType: profile.skinType,
            combinationZone: profile.combinationZone || undefined,
            concerns: profile.concerns,
            budget: profile.budget,
            preference: profile.preference,
            allergies: profile.allergies,
            pregnant: profile.pregnant,
            favoriteBrands: profile.favoriteBrands,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Decide ${res.status}`);
      setResult(data as Decision);
    } catch (e: any) {
      toast.error(e.message || (ar ? "فشل التحليل" : "Failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MobileShell>
        <header className="mb-5">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            {ar ? "قبل ما تشتري" : "Before You Buy"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ar
              ? "صور المنتج أو اكتب اسمه — هنقولك مناسبلك ولا لأ، وليه، والبديل، وفي تعارض ولا لأ."
              : "Photograph or name a product — we tell you if it fits you, why, alternatives, and conflicts."}
          </p>
        </header>

        <label className="relative block rounded-2xl border-2 border-dashed border-border bg-card/50 p-3 text-center cursor-pointer hover:border-primary/50 transition-all aspect-[4/3]">
          {preview ? (
            <>
              <img src={preview} className="w-full h-full object-cover rounded-xl" alt="" />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  clearImage();
                }}
                className="absolute top-3 end-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 h-full">
              <div className="w-14 h-14 rounded-2xl gradient-aurora flex items-center justify-center shadow-glow">
                <Camera className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="font-semibold text-sm">
                {ar ? "صور المنتج" : "Photograph product"}
              </div>
              <div className="text-xs text-muted-foreground">
                {ar ? "أو اكتب اسمه بالأسفل" : "or type the name below"}
              </div>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])}
          />
        </label>

        <input
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder={ar ? "مثال: سيرافي غسول رغوي" : "e.g. CeraVe Foaming Cleanser"}
          className="mt-3 w-full h-11 rounded-2xl bg-card border border-border px-4 text-sm outline-none focus:border-primary/60"
        />

        <textarea
          value={routineText}
          onChange={(e) => setRoutineText(e.target.value)}
          placeholder={
            ar
              ? "روتينك الحالي (اختياري) — افصل بسطر أو فاصلة"
              : "Current routine (optional) — separate by line or comma"
          }
          rows={2}
          className="mt-2 w-full rounded-2xl bg-card border border-border px-4 py-2.5 text-sm outline-none focus:border-primary/60 resize-none"
        />

        <button
          onClick={decide}
          disabled={loading}
          className="mt-3 w-full h-12 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {ar ? "بحلل..." : "Analyzing..."}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {ar ? "احسبهالي" : "Decide for me"}
            </>
          )}
        </button>

        {result && <DecisionCard d={result} ar={ar} />}
      </MobileShell>
      <BottomNav />
    </>
  );
}

function DecisionCard({ d, ar }: { d: Decision; ar: boolean }) {
  const verdictStyle: Record<Verdict, { bg: string; Icon: typeof CheckCircle2; label: string }> = {
    suitable: {
      bg: "from-emerald-500/80 to-teal-500/80",
      Icon: CheckCircle2,
      label: ar ? "مناسب لك" : "Suitable",
    },
    caution: {
      bg: "from-amber-500/80 to-orange-500/80",
      Icon: AlertTriangle,
      label: ar ? "اشتري بحذر" : "Caution",
    },
    not_suitable: {
      bg: "from-rose-500/80 to-red-500/80",
      Icon: XCircle,
      label: ar ? "مش مناسب" : "Not suitable",
    },
  };
  const v = verdictStyle[d.verdict] ?? verdictStyle.caution;
  const Icon = v.Icon;

  return (
    <div className="mt-5 space-y-3 animate-float-up">
      <div className={`rounded-2xl p-4 bg-gradient-to-br ${v.bg} text-white shadow-glow`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-6 h-6" />
            <div>
              <div className="text-xs opacity-80">{v.label}</div>
              <div className="font-bold text-lg leading-tight">{d.productName}</div>
            </div>
          </div>
          <div className="text-end">
            <div className="text-2xl font-bold">{d.matchScore}</div>
            <div className="text-[10px] opacity-80">{ar ? "توافق/100" : "match/100"}</div>
          </div>
        </div>
        <div className="mt-3 text-sm leading-relaxed">{d.summary}</div>
        {d.buyDecision && (
          <div className="mt-3 inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1.5 rounded-full text-sm font-semibold">
            👉 {d.buyDecision}
          </div>
        )}
      </div>

      {d.reasons?.length > 0 && (
        <Section title={ar ? "ليه؟" : "Why?"}>
          <ul className="list-disc ps-5 space-y-1 text-sm leading-relaxed">
            {d.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </Section>
      )}

      {d.ingredientConflicts?.length > 0 && (
        <Section title={ar ? "تعارضات المكونات" : "Ingredient Conflicts"}>
          <div className="space-y-2">
            {d.ingredientConflicts.map((c, i) => (
              <div
                key={i}
                className={`rounded-xl p-3 border text-sm ${
                  c.severity === "high"
                    ? "border-rose-500/40 bg-rose-500/10"
                    : c.severity === "medium"
                    ? "border-amber-500/40 bg-amber-500/10"
                    : "border-border bg-muted/30"
                }`}
              >
                <div className="font-semibold">
                  {c.ingredient} ⚡ {c.conflictsWith}
                </div>
                <div className="text-muted-foreground text-xs mt-1">{c.note}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {d.alternatives?.length > 0 && (
        <Section title={ar ? "بدائل أفضل ليك" : "Better Alternatives"}>
          <div className="space-y-2">
            {d.alternatives.map((a, i) => (
              <div key={i} className="rounded-xl p-3 border border-border bg-card">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">
                    {a.name} <span className="text-muted-foreground font-normal">— {a.brand}</span>
                  </div>
                  <div className="text-xs text-primary font-semibold">{a.priceEGP}</div>
                </div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{a.whyBetter}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {d.estimatedSavingsEGP && (
        <div className="rounded-2xl p-3 border border-primary/30 bg-primary/5 flex items-center gap-2 text-sm">
          <Wallet className="w-4 h-4 text-primary" />
          <span className="font-semibold">{ar ? "توفير متوقع:" : "Estimated savings:"}</span>
          <span>{d.estimatedSavingsEGP}</span>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border gradient-card p-4">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}
