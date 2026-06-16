import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  Camera,
  Loader2,
  X,
  ImagePlus,
  Sparkles,
  History,
  Bookmark,
  ShoppingBag,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { LazyImage } from "@/components/LazyImage";
import { LoginGate } from "@/components/LoginGate";
import { ContextualTooltip } from "@/components/ContextualTooltip";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/quick-scan")({
  head: () => ({
    meta: [
      { title: "تحليل فوري — S.o.Skin" },
      {
        name: "description",
        content:
          "حلّل أي منتج عناية بالبشرة فوراً واعرف السعر من الصيدليات بدون تسجيل دخول.",
      },
    ],
  }),
  component: QuickScanPage,
});

interface ProductHit {
  pharmacy: string;
  pharmacyId: string;
  url: string | null;
  price: string | null;
  image: string | null;
  title: string | null;
}

interface QuickResult {
  text: string;
  productName: string | null;
  products: ProductHit[];
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function QuickScanPage() {
  const { profile } = useProfile();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const ar = profile.lang === "ar";

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuickResult | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateReason, setGateReason] = useState<
    { ar: string; en: string } | undefined
  >(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hash an image data URL → stable cache key. Prevents re-calling the API
  // for the same image across re-renders / nav back to this route.
  const hashStr = async (s: string) => {
    const buf = new TextEncoder().encode(s);
    const h = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(h.slice(0, 12)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const analyze = async (file: File) => {
    setResult(null);
    setLoading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setPreview(dataUrl);

      const cacheKey = `qa:${ar ? "ar" : "en"}:${await hashStr(dataUrl)}`;
      const cached =
        typeof sessionStorage !== "undefined"
          ? sessionStorage.getItem(cacheKey)
          : null;
      if (cached) {
        setResult(JSON.parse(cached));
        return;
      }

      const res = await fetch("/api/public/quick-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, lang: ar ? "ar" : "en" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Analysis failed");
      setResult(data);
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
      } catch {
        /* quota — ignore */
      }
    } catch (e: any) {
      toast.error(e.message || (ar ? "فشل التحليل" : "Analysis failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      setGateReason({
        ar: "سجّل دخولك علشان نضيف المنتج لروتينك ونتابع تقدّمك.",
        en: "Sign in to save this product to your routine and track progress.",
      });
      setGateOpen(true);
      return;
    }
    if (!result) return;
    try {
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        await supabase.from("scans").insert({
          user_id: u.user.id,
          product_name: result.productName || (ar ? "(منتج)" : "(product)"),
          result_summary: result.text.slice(0, 500),
        });
        toast.success(ar ? "تم الحفظ في روتينك" : "Saved to your routine");
      }
    } catch {
      toast.error(ar ? "فشل الحفظ" : "Save failed");
    }
  };

  const handleHistory = () => {
    if (!isAuthenticated) {
      setGateReason({
        ar: "سجّل دخولك علشان تشوف كل تحليلاتك السابقة.",
        en: "Sign in to view your full analysis history.",
      });
      setGateOpen(true);
      return;
    }
    navigate({ to: "/history" });
  };

  const clear = () => {
    setPreview(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <MobileShell>
        <header className="mb-5 animate-fade-in">
          <div className="text-[10px] tracking-[0.32em] uppercase text-primary/80 font-semibold">
            {ar ? "تحليل فوري" : "Quick analysis"}
          </div>
          <h1 className="text-2xl font-bold mt-1 text-gradient">
            {ar ? "حلّل منتجك دلوقتي" : "Analyze your product"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {ar
              ? "صور المنتج — هنجيبلك السعر والتحليل بدون تسجيل دخول."
              : "Snap a product — price + ingredient analysis, no login needed."}
          </p>
        </header>

        <label className="relative block rounded-2xl border-2 border-dashed border-primary/30 bg-card/50 p-4 text-center cursor-pointer hover:border-primary/60 transition-all aspect-[4/3]">
          {preview ? (
            <>
              <img
                src={preview}
                className="w-full h-full object-cover rounded-xl"
                alt={ar ? "صورة المنتج" : "Product preview"}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  clear();
                }}
                aria-label={ar ? "مسح" : "Clear"}
                className="absolute top-3 end-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 h-full">
              <div className="w-14 h-14 rounded-2xl gradient-aurora flex items-center justify-center shadow-glow relative">
                <Camera className="w-7 h-7 text-primary-foreground" />
                <ContextualTooltip
                  id="quick-scan-camera"
                  label={ar ? "صوّر" : "Snap"}
                  position="bottom"
                />
              </div>
              <div>
                <div className="font-semibold text-sm">
                  {ar ? "اختر صورة المنتج" : "Choose a product image"}
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  <ImagePlus className="w-3 h-3" />
                  {ar ? "اضغط للرفع" : "Tap to upload"}
                </div>
              </div>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && analyze(e.target.files[0])}
          />
        </label>

        {loading && (
          <div className="mt-4 space-y-3 animate-fade-in">
            <div className="h-28 rounded-2xl shimmer-gold" />
            <div className="h-40 rounded-2xl shimmer-gold" />
          </div>
        )}

        {result && !loading && (
          <div
            className="mt-5 rounded-3xl overflow-hidden border border-primary/30 shadow-glow animate-fade-in"
            style={{ background: "oklch(0.13 0.005 60 / 0.96)" }}
          >
            {/* TOP — Shopper section */}
            <div className="p-4">
              <div className="text-[10px] tracking-[0.32em] uppercase text-primary font-semibold flex items-center gap-1.5">
                <ShoppingBag className="w-3 h-3" />
                {ar ? "أفضل سعر" : "Best price"}
              </div>
              <h3 className="text-base font-bold text-background mt-1 line-clamp-2">
                {result.productName || (ar ? "منتجك" : "Your product")}
              </h3>

              <div className="mt-3 space-y-2">
                {result.products.length === 0 && (
                  <div className="text-xs text-background/60">
                    {ar
                      ? "لم نجد أسعار حالياً، التحليل أدناه."
                      : "No live prices found, see analysis below."}
                  </div>
                )}
                {result.products.map((p) => (
                  <a
                    key={p.pharmacyId}
                    href={p.url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-2.5 rounded-xl border border-primary/25 bg-background/5 hover:border-primary/60 transition ${
                      p.url ? "" : "pointer-events-none opacity-60"
                    }`}
                  >
                    <LazyImage
                      src={p.image}
                      alt={p.title || p.pharmacy}
                      className="w-14 h-14 border border-primary/20"
                      rounded="rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-primary/90 font-semibold">
                        {p.pharmacy}
                      </div>
                      <div className="text-xs text-background/85 line-clamp-1 mt-0.5">
                        {p.title || (ar ? "—" : "—")}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-primary whitespace-nowrap">
                      {p.price || "—"}
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Soft Gold divider */}
            <div
              className="h-px mx-4"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.78 0.13 85 / 0.6), transparent)",
              }}
            />

            {/* BOTTOM — Expert section */}
            <div className="p-4">
              <div className="text-[10px] tracking-[0.32em] uppercase text-primary font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                {ar ? "تحليل المكونات" : "Ingredient analysis"}
              </div>
              <pre className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-background/90 font-sans">
                {result.text}
              </pre>
            </div>

            {/* Actions */}
            <div className="p-4 pt-0 grid grid-cols-2 gap-2">
              <button
                onClick={handleSave}
                className="relative h-11 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm shadow-glow flex items-center justify-center gap-1.5"
              >
                <Bookmark className="w-4 h-4" />
                {ar ? "احفظ للروتين" : "Save to routine"}
                <ContextualTooltip
                  id="quick-scan-save"
                  label={ar ? "احفظ" : "Save"}
                  position="top"
                />
              </button>
              <button
                onClick={handleHistory}
                className="h-11 rounded-xl border border-primary/40 text-primary font-semibold text-sm flex items-center justify-center gap-1.5"
              >
                <History className="w-4 h-4" />
                {ar ? "كل التحليلات" : "Full history"}
              </button>
            </div>
          </div>
        )}
      </MobileShell>

      <LoginGate
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        reason={gateReason}
      />
      <BottomNav />
    </>
  );
}
