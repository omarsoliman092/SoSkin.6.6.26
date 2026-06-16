import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Loader2,
  Search,
  UserPlus,
  Phone,
  Save,
  Trash2,
  Sparkles,
  X,
  MessageCircle,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { PremiumGate } from "@/components/PremiumGate";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/beauty-pass")({
  component: () => (
    <PremiumGate
      featureKey="beauty_pass"
      isExpert
      title="العميل أمامي / VIP Follow-Up"
      subtitle="يرجى الترقية إلى النسخة الـ PRO للاستفادة من كافة ميزات S.O.SKIN الاحترافية."
      benefits={[
        "ملفات عملاء VIP كاملة",
        "متابعة موعد إعادة الشراء عبر واتساب",
        "اقتراحات منتجات ذكية لكل عميل",
      ]}
    >
      <BeautyPassPage />
    </PremiumGate>
  ),
});

type Customer = {
  id: string;
  phone: string;
  name: string;
  age_range: string;
  skin_type: string;
  concerns: string[];
  last_products: string[];
  notes: string;
  last_visit: string;
  updated_at: string;
};

type NextBest = {
  primary: {
    product: string;
    brand: string;
    category: string;
    priceEGP: string;
    whyNow: string;
    pairsWith: string[];
    objectionCounter: string;
  };
  alternatives: { product: string; brand: string; priceEGP: string; tradeoff: string }[];
  scriptOpener: string;
};

function BeautyPassPage() {
  const { profile, ready } = useProfile();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const ar = profile.lang === "ar";

  const [query, setQuery] = useState("");
  const [list, setList] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Customer> | null>(null);
  const [suggestion, setSuggestion] = useState<NextBest | null>(null);
  const [suggLoading, setSuggLoading] = useState(false);
  const [activeCust, setActiveCust] = useState<Customer | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("customer_lookups")
      .select("*")
      .order("last_visit", { ascending: false })
      .limit(100);
    if (error) toast.error(error.message);
    setList((data || []) as Customer[]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) void load();
    else setLoading(false);
  }, [isAuthenticated]);

  if (!ready) return null;

  if (!isAuthenticated) {
    return (
      <>
        <MobileShell>
          <div className="text-center py-20">
            <h2 className="text-lg font-bold mb-2">{ar ? "سجّل الدخول" : "Sign in"}</h2>
            <button
              onClick={() => navigate({ to: "/login" })}
              className="h-11 px-5 rounded-2xl gradient-primary text-primary-foreground font-semibold"
            >
              {ar ? "تسجيل الدخول" : "Sign in"}
            </button>
          </div>
        </MobileShell>
        <BottomNav />
      </>
    );
  }

  const filtered = query.trim()
    ? list.filter(
        (c) =>
          c.phone.includes(query) ||
          c.name.toLowerCase().includes(query.toLowerCase()),
      )
    : list;

  const save = async () => {
    if (!editing) return;
    const phone = (editing.phone || "").trim();
    if (phone.length < 6) return toast.error(ar ? "رقم تليفون غير صحيح" : "Invalid phone");
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const payload = {
      expert_id: userData.user.id,
      phone,
      name: editing.name || "",
      age_range: editing.age_range || "",
      skin_type: editing.skin_type || "",
      concerns: editing.concerns || [],
      last_products: editing.last_products || [],
      notes: editing.notes || "",
      last_visit: new Date().toISOString().slice(0, 10),
    };
    const { error } = await supabase
      .from("customer_lookups")
      .upsert(payload, { onConflict: "expert_id,phone" });
    if (error) return toast.error(error.message);
    toast.success(ar ? "تم الحفظ" : "Saved");
    setEditing(null);
    await load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("customer_lookups").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setList((prev) => prev.filter((c) => c.id !== id));
    if (activeCust?.id === id) setActiveCust(null);
  };

  const fetchNextBest = async (c: Customer) => {
    setActiveCust(c);
    setSuggestion(null);
    setSuggLoading(true);
    try {
      const r = await fetch("/api/public/next-best", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang: profile.lang,
          customer: {
            name: c.name,
            ageRange: c.age_range,
            skinType: c.skin_type,
            concerns: c.concerns,
            lastProducts: c.last_products,
            notes: c.notes,
          },
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "fail");
      setSuggestion(j);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSuggLoading(false);
    }
  };

  const whatsappReplenish = (c: Customer) => {
    const last = c.last_products[0] || (ar ? "منتجك" : "your product");
    const msg = ar
      ? `أهلاً ${c.name || ""} 👋 معاكي SOSKIN — حابين نفكّرك إن ${last} غالباً قارب يخلص. تحبي نجهّزهولك؟`
      : `Hi ${c.name || ""} 👋 This is SOSKIN — just a friendly reminder that your ${last} is likely running low. Want us to prep a refill?`;
    const digits = (c.phone || "").replace(/\D/g, "");
    if (!digits) {
      toast.error(ar ? "رقم العميل غير صالح" : "Invalid customer phone");
      return;
    }
    let wa = digits;
    if (wa.startsWith("00")) wa = wa.slice(2);
    else if (wa.startsWith("20")) wa = wa;
    else if (wa.startsWith("0")) wa = "20" + wa.slice(1);
    const url = `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) window.location.href = url;
  };

  return (
    <>
      <MobileShell>
        <header className="mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Phone className="w-6 h-6 text-primary" />
            {ar ? "VIP Follow Up" : "VIP Follow Up"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ar
              ? "ابحثي عن العميل برقم التليفون — تاريخه + اقتراح المنتج التالي"
              : "Look up customers by phone — history + next-best product"}
          </p>
        </header>

        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={ar ? "اسم أو رقم..." : "Name or phone..."}
              className="w-full h-11 ps-10 pe-3 rounded-2xl bg-card border border-border text-sm"
            />
          </div>
          <button
            onClick={() => setEditing({})}
            className="h-11 px-4 rounded-2xl gradient-primary text-primary-foreground shadow-glow flex items-center gap-1.5 text-sm font-semibold"
          >
            <UserPlus className="w-4 h-4" />
            {ar ? "جديد" : "New"}
          </button>
        </div>

        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            {ar ? "مفيش عملاء بعد. اضغطي «جديد»." : "No customers yet. Tap “New”."}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold truncate">
                      {c.name || (ar ? "بدون اسم" : "Unnamed")}
                    </div>
                    <div className="text-xs text-muted-foreground">{c.phone} • {c.last_visit}</div>
                    {(c.skin_type || c.concerns?.length > 0) && (
                      <div className="text-[11px] text-muted-foreground mt-1 truncate">
                        {[c.skin_type, ...c.concerns].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => remove(c.id)}
                    aria-label="Remove client"
                    className="text-muted-foreground hover:text-destructive p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => fetchNextBest(c)}
                    className="flex-1 h-9 rounded-xl gradient-aurora text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 shadow-glow"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {ar ? "المنتج التالي" : "Next Best"}
                  </button>
                  <button
                    onClick={() => whatsappReplenish(c)}
                    className="h-9 px-3 rounded-xl border border-border text-xs font-semibold flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-primary" />
                    WA
                  </button>
                  <button
                    onClick={() => setEditing(c)}
                    className="h-9 px-3 rounded-xl border border-border text-xs font-semibold"
                  >
                    {ar ? "تعديل" : "Edit"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </MobileShell>

      {editing && (
        <EditModal
          ar={ar}
          value={editing}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}

      {(suggestion || suggLoading) && activeCust && (
        <SuggestionModal
          ar={ar}
          customer={activeCust}
          data={suggestion}
          loading={suggLoading}
          onClose={() => {
            setSuggestion(null);
            setActiveCust(null);
          }}
        />
      )}

      <BottomNav />
    </>
  );
}

function EditModal({
  ar,
  value,
  onChange,
  onClose,
  onSave,
}: {
  ar: boolean;
  value: Partial<Customer>;
  onChange: (v: Partial<Customer>) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const set = (k: keyof Customer, v: any) => onChange({ ...value, [k]: v });
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-card border border-border rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="text-base font-bold">
            {value.id ? (ar ? "تعديل عميل" : "Edit Customer") : ar ? "عميل جديد" : "New Customer"}
          </div>
          <button onClick={onClose} aria-label="Close dialog" className="text-muted-foreground">

            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <Field label={ar ? "تليفون" : "Phone"}>
            <input
              value={value.phone || ""}
              onChange={(e) => set("phone", e.target.value)}
              inputMode="tel"
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm"
            />
          </Field>
          <Field label={ar ? "الاسم" : "Name"}>
            <input
              value={value.name || ""}
              onChange={(e) => set("name", e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm"
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label={ar ? "السن" : "Age range"}>
              <input
                value={value.age_range || ""}
                onChange={(e) => set("age_range", e.target.value)}
                placeholder="25-34"
                className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm"
              />
            </Field>
            <Field label={ar ? "نوع البشرة" : "Skin type"}>
              <input
                value={value.skin_type || ""}
                onChange={(e) => set("skin_type", e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm"
              />
            </Field>
          </div>
          <Field label={ar ? "مشاكل (مفصولة بفاصلة)" : "Concerns (comma-separated)"}>
            <input
              value={(value.concerns || []).join(", ")}
              onChange={(e) =>
                set(
                  "concerns",
                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                )
              }
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm"
            />
          </Field>
          <Field label={ar ? "آخر منتجات اشترتها" : "Last products bought"}>
            <input
              value={(value.last_products || []).join(", ")}
              onChange={(e) =>
                set(
                  "last_products",
                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                )
              }
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm"
            />
          </Field>
          <Field label={ar ? "ملاحظات" : "Notes"}>
            <textarea
              value={value.notes || ""}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl bg-background border border-border text-sm resize-none"
            />
          </Field>
        </div>
        <button
          onClick={onSave}
          className="w-full mt-4 h-11 rounded-2xl gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-glow"
        >
          <Save className="w-4 h-4" />
          {ar ? "حفظ" : "Save"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
        {label}
      </div>
      {children}
    </label>
  );
}

function SuggestionModal({
  ar,
  customer,
  data,
  loading,
  onClose,
}: {
  ar: boolean;
  customer: Customer;
  data: NextBest | null;
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-card border border-border rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-primary font-semibold">
              {ar ? "اقتراح بيع" : "Cross-Sell"}
            </div>
            <div className="text-base font-bold">{customer.name || customer.phone}</div>
          </div>
          <button onClick={onClose} aria-label="Close dialog" className="text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading && (
          <div className="py-10 flex flex-col items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            {ar ? "بنحضّر الاقتراح..." : "Preparing suggestion..."}
          </div>
        )}

        {data && (
          <div className="space-y-3 animate-float-up">
            <div className="rounded-2xl gradient-aurora border border-primary/30 p-4 text-primary-foreground">
              <div className="text-[10px] uppercase tracking-wider opacity-80">
                {data.primary.category}
              </div>
              <div className="text-base font-bold mt-1">{data.primary.product}</div>
              <div className="text-xs opacity-90">
                {data.primary.brand} • {data.primary.priceEGP}
              </div>
              <div className="text-xs mt-2 leading-relaxed">{data.primary.whyNow}</div>
            </div>

            {data.primary.pairsWith?.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                  {ar ? "يتكامل مع" : "Pairs with"}
                </div>
                <div className="text-sm">{data.primary.pairsWith.join(" + ")}</div>
              </div>
            )}

            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3">
              <div className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">
                {ar ? "افتتاحية المحادثة" : "Opener"}
              </div>
              <div className="text-sm italic">"{data.scriptOpener}"</div>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3">
              <div className="text-[10px] uppercase tracking-wider text-amber-500 font-semibold mb-1">
                {ar ? "ردّ على الاعتراض" : "Objection counter"}
              </div>
              <div className="text-xs leading-relaxed">{data.primary.objectionCounter}</div>
            </div>

            {data.alternatives?.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                  {ar ? "بدائل" : "Alternatives"}
                </div>
                <div className="space-y-1.5">
                  {data.alternatives.map((a, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-2.5">
                      <div className="text-sm font-semibold">{a.product}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {a.brand} • {a.priceEGP}
                      </div>
                      <div className="text-[11px] mt-1">{a.tradeoff}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
