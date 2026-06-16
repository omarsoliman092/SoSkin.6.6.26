import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  Camera,
  Loader2,
  ShieldCheck,
  X,
  ImagePlus,
  GraduationCap,
  ChevronUp,
  ChevronDown,
  Crown,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { FaceSkinScanner } from "@/components/FaceSkinScanner";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { tr } from "@/lib/profile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePaywall, FREE_SCAN_LIMIT } from "@/hooks/usePaywall";
import { PricingPaywallModal } from "@/components/PricingPaywallModal";

export const Route = createFileRoute("/scan")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: search.tab === "face" ? ("face" as const) : ("product" as const),
  }),
  head: () => ({
    meta: [
      { title: "Ingredient Scan — SoSkin" },
      { name: "description", content: "Scan any cosmetic product label with your camera and instantly decode its ingredients with SoSkin AI." },
      { property: "og:title", content: "Ingredient Scan — SoSkin" },
      { property: "og:description", content: "Scan any cosmetic product label with your camera and instantly decode its ingredients with SoSkin AI." },
    ],
  }),
  component: ScanPage,
});



const ANALYZE_URL = "/api/public/analyze";
const COMPAT_URL = "/api/public/compat";
const ACADEMY_WHATSAPP = `https://wa.me/201141519948?text=${encodeURIComponent("أهلاً S.O.S Academy، حابب أستفسر عن الكورسات والتدريب.")}`;
const INSTAPAY_HANDLE = "omarsoliman007@instapay";
const INSTAPAY_PHONE = "01141519948";

type Compat = {
  score: number;
  verdict: "perfect" | "good" | "caution" | "avoid";
  pros: string[];
  cons: string[];
  tip: string;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function ScanPage() {
  const { profile, ready } = useProfile();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const t = tr(profile.lang);
  const ar = profile.lang === "ar";

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState("");
  const [compat, setCompat] = useState<Compat | null>(null);
  const [compatLoading, setCompatLoading] = useState(false);
  const [academyOpen, setAcademyOpen] = useState(true);
  const [instaPayOpen, setInstaPayOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { tab: initialTab } = Route.useSearch();
  const [tab, setTab] = useState<"product" | "face">(initialTab);

  const inputRef = useRef<HTMLInputElement>(null);
  const { isPro, canScan, recordScan, scansLeft, paywallOpen, openPaywall, closePaywall } = usePaywall();



  if (!ready) return null;

  if (!isAuthenticated) {
    return (
      <>
        <MobileShell>
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="w-14 h-14 rounded-2xl gradient-aurora flex items-center justify-center mb-4">
              <ShieldCheck className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">
              {ar ? "سجّل الدخول للبدء" : "Sign in to start"}
            </h2>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs">
              {ar
                ? "كل فحص يُحفظ في ملفك الشخصي. سجّل دخولك أو أنشئ حساب."
                : "Every scan is saved to your profile. Sign in or create an account."}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate({ to: "/login" })}
                className="h-11 px-5 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow text-sm"
              >
                {ar ? "تسجيل الدخول" : "Sign in"}
              </button>
              <button
                onClick={() => navigate({ to: "/signup" })}
                className="h-11 px-5 rounded-2xl border border-border text-sm font-semibold"
              >
                {ar ? "حساب جديد" : "Sign up"}
              </button>
            </div>
          </div>
        </MobileShell>
        <BottomNav />
      </>
    );
  }

  const onPick = (f: File) => {
    if (!canScan) {
      openPaywall(false);
      toast.error(ar ? `وصلت لحد ${FREE_SCAN_LIMIT} فحوصات مجانية لهذا الشهر` : `Reached your ${FREE_SCAN_LIMIT} free scans this month`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setReport("");
    setCompat(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
    void analyzeFile(f);
  };

  const analyzeFile = async (selectedFile: File) => {
    setLoading(true);
    setReport("");

    try {
      const dataUrl = await fileToDataUrl(selectedFile);

      const res = await fetch(ANALYZE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, lang: ar ? "ar" : "en" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || `Analyze ${res.status}`);
      }
      const text: string = data.text || "";
      if (!text) throw new Error(ar ? "لم يتم استخراج نص" : "Empty response");

      setReport(text);
      recordScan();

      // Fire-and-forget compatibility score against user profile
      setCompatLoading(true);
      fetch(COMPAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productText: text,
          lang: ar ? "ar" : "en",
          skinType: profile.skinType,
          concerns: profile.concerns,
          pregnant: profile.pregnant,
          allergies: profile.allergies,
        }),
      })
        .then((r) => r.json())
        .then((j) => {
          if (j && typeof j.score === "number") setCompat(j);
        })
        .catch(() => {})
        .finally(() => setCompatLoading(false));

      // Log scan
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from("scans").insert({
          user_id: userData.user.id,
          product_name: extractProductName(text) || (ar ? "(منتج)" : "(product)"),
          result_summary: text.slice(0, 500),
        });
      }
    } catch (e: any) {
      toast.error(e.message || (ar ? "فشل التحليل" : "Analysis failed"));
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    setReport("");
    setCompat(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <MobileShell>
        <header className="mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            {ar ? "حلّل" : "Analyze"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ar
              ? "اعرف نوع بشرتك أو حلّل مكونات منتجك"
              : "Detect your skin type or analyze any product's ingredients"}
          </p>
        </header>

        {/* Tabs */}
        <div className="mb-4 grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-card/60 border border-border">
          <button
            type="button"
            onClick={() => setTab("face")}
            className={`h-10 rounded-xl text-sm font-semibold transition-all ${
              tab === "face" ? "gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground"
            }`}
          >
            {ar ? "تحليل بشرتك" : "Your skin"}
          </button>
          <button
            type="button"
            onClick={() => setTab("product")}
            className={`h-10 rounded-xl text-sm font-semibold transition-all ${
              tab === "product" ? "gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground"
            }`}
          >
            {ar ? "تحليل المنتج" : "Product"}
          </button>
        </div>

        {tab === "face" && <FaceSkinScanner />}

        {tab === "product" && (
          <>
        {!isPro && (
          <button
            onClick={() => scansLeft === 0 && openPaywall(false)}
            className={`mb-3 w-full rounded-2xl border px-4 py-2.5 flex items-center justify-between text-xs ${
              scansLeft === 0 ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-primary/30 bg-primary/5 text-primary"
            }`}
          >
            <span className="flex items-center gap-1.5 font-semibold">
              <Crown className="w-3.5 h-3.5" />
              {ar
                ? scansLeft === 0
                  ? `استهلكت ${FREE_SCAN_LIMIT}/${FREE_SCAN_LIMIT} فحوصات — ترقّى للـ PRO`
                  : `متبقى ${scansLeft} من ${FREE_SCAN_LIMIT} فحوصات مجانية`
                : scansLeft === 0
                  ? `Used ${FREE_SCAN_LIMIT}/${FREE_SCAN_LIMIT} free scans — upgrade to PRO`
                  : `${scansLeft} of ${FREE_SCAN_LIMIT} free scans left this month`}
            </span>
            <span className="opacity-70 text-[10px] uppercase tracking-wider">{ar ? "ترقية" : "Upgrade"}</span>
          </button>
        )}


        {/* Premium SOS Academy banner */}
        <div className="mb-4 rounded-2xl border border-primary/30 gradient-aurora p-4 shadow-glow">
          <button
            type="button"
            onClick={() => setAcademyOpen((v) => !v)}
            className="w-full flex items-center gap-3 text-start"
            aria-expanded={academyOpen}
          >
            <div className="w-10 h-10 rounded-xl bg-background/15 backdrop-blur flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] tracking-[0.25em] uppercase text-primary-foreground/80 font-semibold">
                {ar ? "أكاديمية SOSKIN" : "SOSKIN Academy"}
              </div>
              <div className="text-sm font-bold text-primary-foreground truncate">
                {ar ? "انضمي مجاناً عبر واتساب" : "Join free via WhatsApp"}
              </div>
            </div>
            {academyOpen ? (
              <ChevronUp className="w-5 h-5 text-primary-foreground/80" />
            ) : (
              <ChevronDown className="w-5 h-5 text-primary-foreground/80" />
            )}
          </button>

          {academyOpen && (
            <div className="mt-3 pt-3 border-t border-primary-foreground/15 space-y-3">
              <p className="text-xs text-primary-foreground/90 leading-relaxed">
                {ar
                  ? "تواصلي مع فريق الأكاديمية مباشرة للحصول على روتين مخصص ودروس حصرية."
                  : "Connect directly with the Academy team for a tailored routine and exclusive lessons."}
              </p>
              <div className="flex gap-2">
                <a
                  href={ACADEMY_WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-10 rounded-xl bg-background text-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition"
                >
                  {ar ? "افتح واتساب" : "Open WhatsApp"}
                </a>
                <button
                  type="button"
                  onClick={() => setInstaPayOpen(true)}
                  className="h-10 px-4 rounded-xl border border-primary-foreground/30 text-primary-foreground font-semibold text-sm flex items-center gap-1.5 hover:bg-background/10 transition"
                >
                  <Crown className="w-4 h-4" />
                  {ar ? "ترقية Pro" : "Go Pro"}
                </button>
              </div>
            </div>
          )}
        </div>

        <label className="relative block rounded-2xl border-2 border-dashed border-border bg-card/50 p-4 text-center cursor-pointer hover:border-primary/50 transition-all aspect-[4/3]">

          {preview ? (
            <>
              <img src={preview} className="w-full h-full object-cover rounded-xl" alt="Selected product label preview" />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  clearImage();
                }}
                aria-label="Clear selected image"
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
              <div>
                <div className="font-semibold text-sm">
                  {ar ? "افتح الكاميرا أو اختر صورة" : "Open camera or pick a photo"}
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  <ImagePlus className="w-3 h-3" />
                  {ar ? "اضغط لرفع صورة المنتج" : "Tap to upload product image"}
                </div>
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




        {loading && (
          <div className="w-full mt-3 h-12 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {ar ? "جاري فحص الصورة..." : "Analyzing image..."}
          </div>
        )}

        {report && <ReportCard text={report} ar={ar} />}
        {report && (compatLoading || compat) && (
          <CompatCard compat={compat} loading={compatLoading} ar={ar} />
        )}
          </>
        )}
      </MobileShell>

      {instaPayOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setInstaPayOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-sm bg-card border border-border rounded-t-3xl sm:rounded-3xl p-6 shadow-glow animate-in slide-in-from-bottom-4 duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                  <Crown className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-semibold">
                    {ar ? "ترقية Pro" : "Pro upgrade"}
                  </div>
                  <div className="text-base font-bold">
                    {ar ? "ادفع عبر InstaPay" : "Pay via InstaPay"}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInstaPayOpen(false)}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition"
                aria-label={ar ? "إغلاق" : "Close"}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl border border-primary/30 gradient-aurora p-4 text-center mb-4">
              <div className="text-[10px] tracking-[0.25em] uppercase text-primary-foreground/80 font-semibold">
                {ar ? "حوّل المبلغ إلى" : "Transfer to"}
              </div>
              <div className="text-lg font-bold text-primary-foreground mt-1 tracking-wide">
                {INSTAPAY_HANDLE}
              </div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-primary-foreground/70 mt-2">
                {ar ? "أو رقم إنستا باي" : "or InstaPay number"}
              </div>
              <div className="text-base font-bold text-primary-foreground mt-1 tracking-wider ltr-text" dir="ltr">
                {INSTAPAY_PHONE}
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(INSTAPAY_HANDLE);
                  setCopied(true);
                  toast.success(ar ? "تم النسخ" : "Copied");
                  setTimeout(() => setCopied(false), 1500);
                } catch {
                  toast.error(ar ? "فشل النسخ" : "Copy failed");
                }
              }}
              className="w-full h-11 rounded-2xl border border-border font-semibold text-sm flex items-center justify-center gap-2 mb-2 hover:border-primary/50 transition"
            >
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              {ar ? "انسخ المعرف" : "Copy handle"}
            </button>

            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              {ar
                ? "بعد التحويل أرسلي إيصال الدفع على واتساب الأكاديمية لتفعيل اشتراك Pro."
                : "After transfer, send the receipt to the Academy WhatsApp to activate Pro."}
            </p>
          </div>
        </div>
      )}

      <BottomNav />
      <PricingPaywallModal isOpen={paywallOpen} onClose={closePaywall} isExpertModel={false} />
    </>

  );
}

function CompatCard({ compat, loading, ar }: { compat: Compat | null; loading: boolean; ar: boolean }) {
  if (loading && !compat) {
    return (
      <div className="mt-3 rounded-2xl border border-border gradient-card p-4 flex items-center gap-3">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <div className="text-xs text-muted-foreground">
          {ar ? "بنحسب التوافق مع بشرتك..." : "Scoring fit for your skin..."}
        </div>
      </div>
    );
  }
  if (!compat) return null;
  const s = compat.score;
  const tone =
    compat.verdict === "perfect"
      ? "border-green-500/40 bg-green-500/10 text-green-500"
      : compat.verdict === "good"
      ? "border-primary/40 bg-primary/10 text-primary"
      : compat.verdict === "caution"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-500"
      : "border-destructive/40 bg-destructive/10 text-destructive";
  const label = ar
    ? compat.verdict === "perfect"
      ? "مثالي"
      : compat.verdict === "good"
      ? "جيد"
      : compat.verdict === "caution"
      ? "احذري"
      : "تجنّبي"
    : compat.verdict.toUpperCase();

  return (
    <div className="mt-3 rounded-2xl border border-border gradient-card p-4 animate-float-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          {ar ? "توافق مع بشرتك" : "Fit for your skin"}
        </div>
        <div className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${tone}`}>
          {label}
        </div>
      </div>
      <div className="flex items-end gap-2 mb-3">
        <div className="text-4xl font-bold tabular-nums">{s}</div>
        <div className="text-xs text-muted-foreground mb-1">/100</div>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
        <div
          className={`h-full ${
            s >= 80 ? "bg-green-500" : s >= 60 ? "bg-primary" : s >= 40 ? "bg-amber-500" : "bg-destructive"
          }`}
          style={{ width: `${Math.max(0, Math.min(100, s))}%` }}
        />
      </div>
      {compat.pros?.length > 0 && (
        <div className="mb-2">
          <div className="text-[10px] uppercase tracking-wider text-green-500 font-semibold mb-1">
            {ar ? "نقاط القوة" : "Pros"}
          </div>
          <ul className="text-xs space-y-0.5 list-disc ps-4">
            {compat.pros.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}
      {compat.cons?.length > 0 && (
        <div className="mb-2">
          <div className="text-[10px] uppercase tracking-wider text-destructive font-semibold mb-1">
            {ar ? "انتبهي" : "Watch out"}
          </div>
          <ul className="text-xs space-y-0.5 list-disc ps-4">
            {compat.cons.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}
      {compat.tip && (
        <div className="text-xs mt-2 p-2 rounded-xl bg-primary/5 border border-primary/20">
          💡 {compat.tip}
        </div>
      )}
    </div>
  );
}

function ReportCard({ text, ar }: { text: string; ar: boolean }) {
  const parsed = parseReport(text);
  const hasAny =
    parsed.productName || parsed.benefits || parsed.ingredients || parsed.usage;

  return (
    <div className="mt-5 space-y-3 animate-float-up">
      <div className="rounded-2xl border border-primary/30 gradient-aurora p-4">
        <div className="text-xs uppercase tracking-wider text-primary-foreground/80 font-semibold">
          {ar ? "تقرير التحليل" : "Analysis Report"}
        </div>
        <div className="text-sm text-primary-foreground mt-1 font-medium">
          {parsed.productName || (ar ? "بواسطة محرّك SoSkin AI" : "Powered by SoSkin AI")}
        </div>
      </div>

      {hasAny ? (
        <div className="rounded-2xl border border-border gradient-card overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {parsed.productName && (
                <Row label={ar ? "📌 اسم المنتج" : "📌 Product"} value={parsed.productName} />
              )}
              {parsed.benefits && (
                <Row label={ar ? "✨ الفوائد" : "✨ Benefits"} value={parsed.benefits} />
              )}
              {parsed.ingredients && (
                <Row
                  label={ar ? "🧪 المواد الفعّالة" : "🧪 Active Ingredients"}
                  value={parsed.ingredients}
                />
              )}
              {parsed.usage && (
                <Row label={ar ? "💡 طريقة الاستخدام" : "💡 How to Use"} value={parsed.usage} />
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-border gradient-card p-3 text-sm whitespace-pre-wrap leading-relaxed">
          {text.trim()}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const items = splitItems(value);
  const isList = items.length > 1;

  return (
    <tr className="border-b border-border last:border-0 align-top">
      <td className="px-3 py-2 text-xs font-semibold text-muted-foreground w-1/3 whitespace-nowrap">
        {label}
      </td>
      <td className="px-3 py-2 leading-relaxed">
        {isList ? (
          <ul className="list-disc ps-4 space-y-1">
            {items.map((item: string, i: number) => (
              <li key={i} className="whitespace-pre-wrap">{item}</li>
            ))}
          </ul>
        ) : (
          <span className="whitespace-pre-wrap">{value}</span>
        )}
      </td>
    </tr>
  );
}

// Markers used by Flowise response. Match emoji + flexible label.
const SECTION_PATTERNS = {
  productName: /📌\s*(?:[إا]سم\s*المنتج|product\s*name)\s*[:：]?\s*/i,
  benefits: /✨\s*(?:فوائد(?:\s*المنتج)?|benefits?)\s*[:：]?\s*/i,
  ingredients: /🧪\s*(?:المواد\s*الفعّ?الة|active\s*ingredients?|ingredients?)\s*[:：]?\s*/i,
  usage: /💡\s*(?:طريقة\s*ال[إا]ستخدام|how\s*to\s*use|usage|directions)\s*[:：]?\s*/i,
} as const;

function parseReport(text: string) {
  const clean = text.replace(/\r/g, "").replace(/\*\*/g, "").trim();

  // Find each marker's index in the text
  const hits: { key: keyof typeof SECTION_PATTERNS; start: number; headerEnd: number }[] = [];
  for (const [key, re] of Object.entries(SECTION_PATTERNS) as [
    keyof typeof SECTION_PATTERNS,
    RegExp,
  ][]) {
    const m = clean.match(re);
    if (m && m.index !== undefined) {
      hits.push({ key, start: m.index, headerEnd: m.index + m[0].length });
    }
  }
  hits.sort((a, b) => a.start - b.start);

  const out: Record<keyof typeof SECTION_PATTERNS, string> = {
    productName: "",
    benefits: "",
    ingredients: "",
    usage: "",
  };

  hits.forEach((hit, i) => {
    const end = i + 1 < hits.length ? hits[i + 1].start : clean.length;
    const value = clean.slice(hit.headerEnd, end).trim().replace(/^[\-•·●:：\s]+/, "").trim();
    out[hit.key] = value;
  });

  return out;
}

function extractProductName(text: string): string {
  return parseReport(text).productName.slice(0, 120);
}

function splitItems(text: string): string[] {
  const clean = text
    .replace(/\r/g, "")
    .replace(/\*\*/g, "")
    .trim();

  // Split by newlines first, then by common bullet markers if still one line
  const byNewline = clean
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (byNewline.length > 1) {
    return byNewline.flatMap((line) => {
      // If a line still contains commas separating distinct items, split further
      const parts = line
        .split(/[,،]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      return parts.length > 1 ? parts : [line];
    });
  }

  // Single block — try bullets / numbers / commas
  const bulletSplit = clean
    .split(/\s*[\-•·●]\s+|\s*\d+[\.\-]\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (bulletSplit.length > 1) return bulletSplit;

  const commaSplit = clean
    .split(/[,،]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (commaSplit.length > 1) return commaSplit;

  return [clean];
}


