import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, Plus, Trash2, AlertTriangle } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { PremiumGate } from "@/components/PremiumGate";
import { toast } from "sonner";

export const Route = createFileRoute("/expiry")({
  component: () => (
    <PremiumGate
      featureKey="expiry"
      title="منبه انتهاء الصلاحية / PAO Expiry Alarm"
      subtitle="يرجى الترقية إلى النسخة الـ PRO للاستفادة من كافة ميزات S.O.SKIN الاحترافية."
      benefits={[
        "تتبّع تاريخ فتح كل منتج",
        "تنبيهات قبل انتهاء صلاحية المنتج",
        "حماية بشرتك من المنتجات التالفة",
      ]}
    >
      <ExpiryPage />
    </PremiumGate>
  ),
});

type Item = {
  id: string;
  name: string;
  openedAt: string; // ISO date
  paoMonths: number;
};

const KEY = "soskin_expiry_v1";

function load(): Item[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function save(items: Item[]) { localStorage.setItem(KEY, JSON.stringify(items)); }

function daysLeft(it: Item) {
  const opened = new Date(it.openedAt).getTime();
  const expireAt = opened + it.paoMonths * 30 * 24 * 3600 * 1000;
  return Math.ceil((expireAt - Date.now()) / (24 * 3600 * 1000));
}

function ExpiryPage() {
  const { profile, ready } = useProfile();
  const ar = profile.lang === "ar";
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [pao, setPao] = useState(12);
  const [opened, setOpened] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => { setItems(load()); }, []);

  if (!ready) return null;

  const add = () => {
    if (name.trim().length < 2) { toast.error(ar ? "اكتب اسم المنتج" : "Enter product name"); return; }
    const next = [...items, { id: crypto.randomUUID(), name: name.trim(), openedAt: opened, paoMonths: pao }];
    setItems(next); save(next); setName("");
    toast.success(ar ? "تمت الإضافة" : "Added");
  };

  const remove = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next); save(next);
  };

  const sorted = [...items].sort((a, b) => daysLeft(a) - daysLeft(b));

  return (
    <>
      <MobileShell>
        <header className="mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            {ar ? "منبه إنتهاء الصلاحية" : "Expiry Alarm"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ar ? "تتبّع تاريخ فتح كل منتج (PAO)" : "Track each product's Period After Opening"}
          </p>
        </header>

        <div className="rounded-2xl border border-border gradient-card p-3 mb-4 space-y-2">
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder={ar ? "اسم المنتج" : "Product name"}
            className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase text-muted-foreground">{ar ? "تاريخ الفتح" : "Opened on"}</label>
              <input type="date" value={opened} onChange={(e) => setOpened(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-background border border-border text-sm" />
            </div>
            <div>
              <label className="text-[10px] uppercase text-muted-foreground">PAO (months)</label>
              <select value={pao} onChange={(e) => setPao(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-background border border-border text-sm">
                {[3, 6, 9, 12, 18, 24, 36].map((m) => <option key={m} value={m}>{m}M</option>)}
              </select>
            </div>
          </div>
          <button onClick={add}
            className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-1.5">
            <Plus className="w-4 h-4" /> {ar ? "إضافة" : "Add"}
          </button>
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center text-xs text-muted-foreground">
            {ar ? "ابدأ بإضافة منتجاتك المفتوحة" : "Start by adding your opened products"}
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((it) => {
              const d = daysLeft(it);
              const danger = d <= 14;
              const warn = d > 14 && d <= 45;
              const tone = danger ? "border-red-500/40 bg-red-500/5" : warn ? "border-amber-500/40 bg-amber-500/5" : "border-border bg-card";
              const label = d < 0 ? (ar ? "منتهي" : "Expired") : `${d} ${ar ? "يوم متبقي" : "days left"}`;
              return (
                <div key={it.id} className={`rounded-2xl border p-3 flex items-center gap-3 ${tone}`}>
                  {danger && <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{it.name}</div>
                    <div className="text-[11px] text-muted-foreground">{label} • PAO {it.paoMonths}M</div>
                  </div>
                  <button onClick={() => remove(it.id)} className="p-2 text-muted-foreground hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </MobileShell>
      <BottomNav />
    </>
  );
}
