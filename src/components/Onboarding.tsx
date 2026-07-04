import { useRef, useState } from "react";
import { Sparkles, ChevronRight, Camera, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfile } from "@/hooks/useProfile";
import { tr, type Lang, type Gender, type CombinationZone, type UserProfile } from "@/lib/profile";
import { toast } from "sonner";
import { SoskinWordmark } from "@/components/SoskinWordmark";

const SKIN_TYPES = ["Oily", "Dry", "Combination", "Normal", "Sensitive"];
const CONCERNS_EN = ["Acne", "Dark spots", "Wrinkles", "Redness", "Dehydration", "Blackheads", "Dullness", "Sun damage"];
const CONCERNS_AR = ["حب الشباب", "التصبغات والبقع الداكنة", "الجفاف والتشققات", "تساقط الشعر", "هالات العين", "تجاعيد حول العين"];
const BUDGETS = ["< 500 EGP", "500–1500", "1500–3000", "3000+"];

export function Onboarding() {
  const { profile, setProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<UserProfile>({ ...profile, onboarded: false });
  const [legal, setLegal] = useState(false);
  const t = tr(draft.lang);
  const fileRef = useRef<HTMLInputElement>(null);
  const [detecting, setDetecting] = useState(false);
  const [detectMsg, setDetectMsg] = useState<string | null>(null);
  const [shots, setShots] = useState<string[]>([]); // up to 3 angles
  const ar = draft.lang === "ar";

  const ANGLES = ar
    ? ["وجه أمامي", "خد يسار", "خد يمين"]
    : ["Front", "Left cheek", "Right cheek"];

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    });

  const addShot = async (file: File) => {
    try {
      const url = await fileToDataUrl(file);
      setShots((prev) => (prev.length >= 3 ? prev : [...prev, url]));
      setDetectMsg(null);
    } catch {
      toast.error(ar ? "فشل تحميل الصورة" : "Failed to load image");
    }
  };

  const resetShots = () => {
    setShots([]);
    setDetectMsg(null);
  };

  const runDetection = async () => {
    if (shots.length === 0) return;
    setDetecting(true);
    setDetectMsg(null);
    try {
      const res = await fetch("/api/public/skin-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrls: shots, lang: ar ? "ar" : "en" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Detection failed");
      if (!data.skinType) {
        toast.error(data.summary || (ar ? "صورة غير واضحة — جرّب صور أوضح" : "Unclear images — try clearer photos"));
        return;
      }
      const CONCERNS = ar ? CONCERNS_AR : CONCERNS_EN;
      const newConcerns = Array.isArray(data.concerns)
        ? Array.from(new Set([...(draft.concerns || []), ...data.concerns.filter((c: string) => CONCERNS.includes(c))]))
        : draft.concerns;
      set({
        skinType: data.skinType,
        combinationZone: data.skinType === "Combination" ? (data.combinationZone || "") : "",
        concerns: newConcerns,
      });
      const conf = data.confidence ? ` (${data.confidence}%)` : "";
      const angles = data.anglesUsed ? ` · ${data.anglesUsed} ${ar ? "زوايا" : "angles"}` : "";
      setDetectMsg(`${data.summary || ""}${conf}${angles}`.trim());
      toast.success(ar ? `تم التحديد: ${data.skinType}` : `Detected: ${data.skinType}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDetecting(false);
    }
  };

  const set = (p: Partial<UserProfile>) => setDraft((d) => ({ ...d, ...p }));
  const toggleConcern = (c: string) =>
    set({ concerns: draft.concerns.includes(c) ? draft.concerns.filter((x) => x !== c) : [...draft.concerns, c] });

  const finish = () => {
    if (!legal) {
      toast.error(ar ? "لازم توافقي على الشروط والخصوصية" : "You must accept the Terms & Privacy Policy");
      return;
    }
    setProfile({ ...draft, onboarded: true, legalAcceptedAt: new Date().toISOString() });
  };


  const isCombo = draft.skinType === "Combination";

  const steps = [
    // Welcome + lang
    <div key="0" className="flex flex-col items-center text-center gap-6 animate-float-up">
      <SoskinWordmark size="xl" asLink={false} />
      <div>
        <p className="text-muted-foreground mt-2">{t.tagline}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full">
        {(["en", "ar"] as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => { set({ lang: l }); setStep((s) => s + 1); }}
            className={`p-4 rounded-2xl border transition-all ${
              draft.lang === l ? "border-primary bg-primary/10 shadow-glow" : "border-border bg-card"
            }`}
          >
            <div className="font-semibold">{l === "en" ? "English" : "العربية"}</div>
          </button>
        ))}
      </div>
    </div>,
    // (Role selection step removed — everyone defaults to customer experience)
    // Recommending for (gender)
    <div key="g" className="flex flex-col gap-5 animate-float-up">
      <div>
        <h2 className="text-2xl font-bold">{t.recommendForQ}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {draft.lang === "ar"
            ? "نضبط الترشيحات وأسلوب التواصل بناءً على هذا."
            : "We tailor recommendations and tone based on this."}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(["female", "male"] as Gender[]).map((g) => (
          <button
            key={g}
            onClick={() => { set({ recommendFor: g, gender: g }); setTimeout(() => setStep((s) => s + 1), 220); }}
            className={`p-5 rounded-2xl border transition-all duration-300 ${
              draft.recommendFor === g ? "border-primary bg-primary/10 shadow-glow scale-[1.02]" : "border-border bg-card"
            }`}
          >
            <div className="text-3xl mb-2">{g === "female" ? "👩" : "👨"}</div>
            <div className="font-semibold">{t[g]}</div>
          </button>
        ))}
      </div>
    </div>,
    // Name + skin type (+ combination zone)
    <div key="2" className="flex flex-col gap-5 animate-float-up">
      <div>
        <label className="text-sm text-muted-foreground">{t.yourName}</label>
        <Input value={draft.name} onChange={(e) => set({ name: e.target.value })} className="mt-2 h-12 rounded-xl" />
      </div>
      <div>
        <label className="text-sm text-muted-foreground">{t.skinType}</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {SKIN_TYPES.map((s) => (
            <button
              key={s}
              onClick={() => set({ skinType: s, combinationZone: s === "Combination" ? draft.combinationZone : "" })}
              className={`p-3 rounded-xl border text-sm ${
                draft.skinType === s ? "border-primary bg-primary/10" : "border-border bg-card"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Pro-grade multi-angle AI skin scanner */}
        <div className="mt-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-3.5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-glow">
              <Camera className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">
                {ar ? "كاشف بشرة احترافي (3 زوايا)" : "Pro skin scanner (3 angles)"}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                {ar
                  ? "صوّر وشك من 3 زوايا لمعرفة نوع بشرتك بدقة."
                  : "Capture your face from 3 angles for an accurate skin-type reading."}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {ANGLES.map((label, i) => {
              const has = !!shots[i];
              const isNext = !has && shots.length === i;
              return (
                <div
                  key={label}
                  className={`relative aspect-square rounded-xl border overflow-hidden flex items-center justify-center ${
                    has
                      ? "border-primary bg-primary/10"
                      : isNext
                        ? "border-primary/60 bg-primary/5 ring-2 ring-primary/30"
                        : "border-dashed border-border bg-card/40 opacity-60"
                  }`}
                >
                  {has ? (
                    <>
                      <img src={shots[i]} className="w-full h-full object-cover" alt={label} />
                      <div className="absolute top-1 end-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    </>
                  ) : (
                    <Camera className="w-4 h-4 text-primary/70" />
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-background/85 text-[10px] font-semibold text-center py-0.5 truncate px-1">
                    {label}
                  </div>
                </div>
              );
            })}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="user"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void addShot(f);
              e.target.value = "";
            }}
          />

          <div className="flex gap-2">
            {shots.length < 3 ? (
              <button
                type="button"
                disabled={detecting}
                onClick={() => fileRef.current?.click()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold shadow-glow disabled:opacity-60"
              >
                <Camera className="w-3.5 h-3.5" />
                {ar ? `صوّر ${ANGLES[shots.length]}` : `Capture ${ANGLES[shots.length]}`}
              </button>
            ) : (
              <button
                type="button"
                disabled={detecting}
                onClick={runDetection}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl gradient-primary text-primary-foreground text-xs font-bold shadow-glow disabled:opacity-60"
              >
                {detecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {detecting
                  ? (ar ? "تحليل احترافي..." : "Pro analysis...")
                  : (ar ? "حلّل البشرة الآن" : "Analyze skin now")}
              </button>
            )}
            {shots.length > 0 && !detecting && (
              <button
                type="button"
                onClick={resetShots}
                className="h-9 px-3 rounded-xl border border-border text-xs font-semibold"
              >
                {ar ? "تصفير" : "Reset"}
              </button>
            )}
          </div>

          {detectMsg && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-[11px] text-foreground/90 leading-relaxed">
              {detectMsg}
            </div>
          )}
        </div>
      </div>
      {isCombo && (
        <div className="animate-float-up">
          <label className="text-sm text-muted-foreground">{t.combinationZoneQ}</label>
          <div className="flex flex-col gap-2 mt-2">
            {(["tzone", "ozone", "uzone"] as CombinationZone[]).map((z) => (
              <button
                key={z}
                onClick={() => set({ combinationZone: z })}
                className={`p-3 rounded-xl border text-sm text-start ${
                  draft.combinationZone === z ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                {t[z as "tzone" | "ozone" | "uzone"]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>,
    // Concerns + budget + pref
    <div key="3" className="flex flex-col gap-5 animate-float-up">
      <div>
        <label className="text-sm text-muted-foreground">{t.concerns}</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {(ar ? CONCERNS_AR : CONCERNS_EN).map((c) => (
            <button
              key={c}
              onClick={() => toggleConcern(c)}
              className={`px-3 py-2 rounded-full border text-sm ${
                draft.concerns.includes(c) ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm text-muted-foreground">{t.budget}</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {BUDGETS.map((b) => (
            <button
              key={b}
              onClick={() => set({ budget: b })}
              className={`p-3 rounded-xl border text-sm ${
                draft.budget === b ? "border-primary bg-primary/10" : "border-border bg-card"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm text-muted-foreground">{t.productPref}</label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {(["egyptian", "imported", "both"] as const).map((p) => (
            <button
              key={p}
              onClick={() => set({ preference: p })}
              className={`p-3 rounded-xl border text-sm ${
                draft.preference === p ? "border-primary bg-primary/10" : "border-border bg-card"
              }`}
            >
              {t[p]}
            </button>
          ))}
        </div>
      </div>
    </div>,
    // Allergies + pregnancy + brands
    <div key="4" className="flex flex-col gap-5 animate-float-up">
      <div>
        <label className="text-sm text-muted-foreground">{t.allergies}</label>
        <Input value={draft.allergies} onChange={(e) => set({ allergies: e.target.value })} className="mt-2 h-12 rounded-xl" />
      </div>
      {draft.recommendFor === "female" && (
        <button
          onClick={() => set({ pregnant: !draft.pregnant })}
          className={`p-4 rounded-2xl border flex justify-between items-center ${
            draft.pregnant ? "border-primary bg-primary/10" : "border-border bg-card"
          }`}
        >
          <span>{t.pregnancy}</span>
          <span className={`w-10 h-6 rounded-full transition-all relative ${draft.pregnant ? "bg-primary" : "bg-muted"}`}>
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-background transition-all ${
                draft.pregnant ? "start-[1.125rem]" : "start-0.5"
              }`}
            />
          </span>
        </button>
      )}
      <div>
        <label className="text-sm text-muted-foreground">{t.favoriteBrands}</label>
        <Input value={draft.favoriteBrands} onChange={(e) => set({ favoriteBrands: e.target.value })} className="mt-2 h-12 rounded-xl" />
      </div>
      {draft.role === "customer" && (
        <div>
          <label className="text-sm text-muted-foreground">{t.answerStyle}</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {(["quick", "detailed"] as const).map((a) => (
              <button
                key={a}
                onClick={() => set({ answerStyle: a })}
                className={`p-3 rounded-xl border text-sm ${
                  draft.answerStyle === a ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                {a === "quick" ? t.quickAnswers : t.detailedExplanation}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Legal acceptance — required to finish */}
      <label className="mt-2 flex items-start gap-3 p-3.5 rounded-2xl border border-border bg-card/60 cursor-pointer hover:border-primary/40 transition-all">
        <input
          type="checkbox"
          checked={legal}
          onChange={(e) => setLegal(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-primary cursor-pointer"
        />
        <span className="text-xs leading-relaxed text-foreground/90">
          {ar ? (
            <>
              أوافق على{" "}
              <a href="/terms" target="_blank" rel="noreferrer" className="text-primary underline">الشروط والأحكام</a>{" "}
              و
              <a href="/privacy" target="_blank" rel="noreferrer" className="text-primary underline"> سياسة الخصوصية</a>،
              وأقرّ بأن SoSkin مساعد ذكاء اصطناعي تعليمي وليس بديلًا عن الاستشارة الطبية.
            </>
          ) : (
            <>
              I agree to the{" "}
              <a href="/terms" target="_blank" rel="noreferrer" className="text-primary underline">Terms of Service</a>{" "}
              and{" "}
              <a href="/privacy" target="_blank" rel="noreferrer" className="text-primary underline">Privacy Policy</a>,
              and acknowledge that SoSkin is an AI educational assistant, not a substitute for medical advice.
            </>
          )}
        </span>
      </label>
    </div>,
  ];

  const isLast = step === steps.length - 1;
  const canNext =
    (step !== 2 || !isCombo || !!draft.combinationZone) &&
    (!isLast || legal);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="fixed inset-0 pointer-events-none gradient-glow opacity-60" />
      <div className="relative flex-1 max-w-md mx-auto w-full px-5 pt-12 pb-6 flex flex-col">
        <div className="flex gap-1.5 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i <= step ? "gradient-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <div className="flex-1">{steps[step]}</div>
        {step > 0 && (
          <div className="mt-8 flex gap-3">
            <Button variant="outline" onClick={() => setStep(step - 1)} className="h-12 rounded-2xl flex-1">
              ←
            </Button>
            <Button
              disabled={!canNext}
              onClick={() => (isLast ? finish() : setStep(step + 1))}
              className="h-12 rounded-2xl flex-[2] gradient-primary text-primary-foreground font-semibold shadow-glow"
            >
              {isLast ? t.finish : t.next} <ChevronRight className="w-4 h-4 ms-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
