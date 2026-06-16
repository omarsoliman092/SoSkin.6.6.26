import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, MessageSquare, Plus, Trash2, Copy, Send, Sparkles } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { usePaywall } from "@/hooks/usePaywall";
import { FeatureLockScreen } from "@/components/FeatureLockScreen";
import { toast } from "sonner";

export const Route = createFileRoute("/replenish")({ component: ReplenishPage });

type Product = { name: string; purchasedDaysAgo: string };
type Result = {
  message: string;
  expectedRunoutDays: number;
  reasoning: string;
  upsellSuggestion: string;
};

// Egypt phone: convert local 01x... or +201x... to 201x... (wa.me format)
function toWa(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("20")) return digits;
  if (digits.startsWith("0")) return "20" + digits.slice(1);
  return digits;
}

function ReplenishPage() {
  const { profile, ready } = useProfile();
  const ar = profile.lang === "ar";
  const { isPro } = usePaywall();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [tone, setTone] = useState<"friendly" | "premium" | "urgent">("friendly");
  const [products, setProducts] = useState<Product[]>([{ name: "", purchasedDaysAgo: "" }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  if (!ready) return null;

  if (!isPro) {
    return (
      <>
        <MobileShell>
          <header className="mb-2">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              {ar ? "تنبيهات إعادة الشراء" : "Replenishment Alerts"}
            </h1>
          </header>
          <FeatureLockScreen
            ar={ar}
            isExpert
            title={ar ? "تنبيهات إعادة الشراء الأوتوماتيكية" : "Automated Replenishment Alerts"}
            subtitle={
              ar
                ? "رسائل واتساب جاهزة لتذكير عملائك بإعادة الشراء فى الوقت المثالى — حصرى للخبراء."
                : "Ready-to-send WhatsApp reminders timed perfectly for re-purchase — Expert Pro only."
            }
            benefits={
              ar
                ? [
                    "حساب تلقائى لتاريخ نفاد كل منتج",
                    "رسائل واتساب بنبرة مخصصة (ودود / فاخر / عاجل)",
                    "إرسال مباشر بنقرة واحدة",
                    "اقتراحات Upsell ذكية مع كل رسالة",
                  ]
                : [
                    "Auto-calculate each product's runout date",
                    "WhatsApp messages with your chosen tone",
                    "One-tap direct send",
                    "Smart upsell suggestions with every message",
                  ]
            }
          />
        </MobileShell>
        <BottomNav />
      </>
    );
  }


  const update = (i: number, k: keyof Product, v: string) =>
    setProducts((p) => p.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));

  const run = async () => {
    const cleaned = products.filter((p) => p.name.trim()).map((p) => ({
      name: p.name.trim(),
      ...(p.purchasedDaysAgo ? { purchasedDaysAgo: Math.max(0, Math.min(365, Number(p.purchasedDaysAgo) || 0)) } : {}),
    }));
    if (!cleaned.length) return toast.error(ar ? "ضيف منتج واحد على الأقل" : "Add at least one product");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/public/replenish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: customerName.trim() || undefined, products: cleaned, tone, lang: ar ? "ar" : "en" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setResult(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.message);
    toast.success(ar ? "اتنسخت" : "Copied");
  };

  const sendWA = () => {
    if (!result) return;
    const wa = toWa(phone);
    const text = encodeURIComponent(result.message);
    const url = wa ? `https://wa.me/${wa}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <MobileShell>
        <header className="mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            {ar ? "متابعة واتساب" : "WhatsApp Replenishment"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ar ? "رسالة تذكير ذكية للعميل قبل ما يخلص" : "Smart refill reminder before customer runs out"}
          </p>
        </header>

        <div className="space-y-3">
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder={ar ? "اسم العميل (اختياري)" : "Customer name (optional)"}
            className="w-full h-11 rounded-2xl bg-card border border-border px-4 text-sm"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            placeholder={ar ? "رقم الواتساب (01xxxxxxxxx)" : "WhatsApp number"}
            className="w-full h-11 rounded-2xl bg-card border border-border px-4 text-sm"
          />

          <div className="grid grid-cols-3 gap-2">
            {(["friendly", "premium", "urgent"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`h-10 rounded-2xl text-xs font-semibold border ${
                  tone === t ? "gradient-primary text-primary-foreground border-primary shadow-glow" : "bg-card border-border text-muted-foreground"
                }`}
              >
                {ar ? (t === "friendly" ? "ودود" : t === "premium" ? "راقي" : "عاجل") : t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-3 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">{ar ? "المنتجات اللى اشتراها" : "Products bought"}</div>
            {products.map((p, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={p.name}
                  onChange={(e) => update(i, "name", e.target.value)}
                  placeholder={ar ? "اسم المنتج" : "Product name"}
                  className="flex-1 h-10 rounded-xl bg-background border border-border px-3 text-sm min-w-0"
                />
                <input
                  value={p.purchasedDaysAgo}
                  onChange={(e) => update(i, "purchasedDaysAgo", e.target.value.replace(/\D/g, ""))}
                  placeholder={ar ? "أيام" : "Days"}
                  inputMode="numeric"
                  className="w-16 h-10 rounded-xl bg-background border border-border px-2 text-sm text-center"
                />
                {products.length > 1 && (
                  <button
                    onClick={() => setProducts((arr) => arr.filter((_, idx) => idx !== i))}
                    className="w-10 h-10 rounded-xl border border-border text-destructive flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {products.length < 8 && (
              <button
                onClick={() => setProducts((p) => [...p, { name: "", purchasedDaysAgo: "" }])}
                className="w-full h-9 rounded-xl border border-dashed border-border text-xs text-muted-foreground flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                {ar ? "ضيف منتج" : "Add product"}
              </button>
            )}
          </div>

          <button
            onClick={run}
            disabled={loading}
            className="w-full h-12 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {ar ? "اكتب الرسالة" : "Generate message"}
          </button>
        </div>

        {result && (
          <div className="mt-5 space-y-3 animate-float-up">
            <div className="rounded-2xl border border-primary/30 bg-card p-4">
              <div className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-2">{ar ? "رسالة الواتساب" : "WhatsApp message"}</div>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{result.message}</pre>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={copy}
                className="h-11 rounded-2xl border border-border bg-card text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {ar ? "نسخ" : "Copy"}
              </button>
              <button
                onClick={sendWA}
                className="h-11 rounded-2xl bg-green-600 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-glow"
              >
                <Send className="w-4 h-4" />
                {ar ? "ابعت واتساب" : "Send WhatsApp"}
              </button>
            </div>

            <div className="rounded-2xl border border-border gradient-card p-3 text-xs space-y-1.5">
              <div><span className="text-primary font-semibold">{ar ? "متوقع يخلص خلال:" : "Runs out in:"}</span> {result.expectedRunoutDays} {ar ? "يوم" : "days"}</div>
              <div><span className="text-primary font-semibold">{ar ? "السبب:" : "Why now:"}</span> {result.reasoning}</div>
              <div><span className="text-primary font-semibold">{ar ? "أب-سيل مقترح:" : "Upsell:"}</span> {result.upsellSuggestion}</div>
            </div>
          </div>
        )}
      </MobileShell>
      <BottomNav />
    </>
  );
}
