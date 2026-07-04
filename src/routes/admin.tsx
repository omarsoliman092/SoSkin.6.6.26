import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  BarChart3,
  Users,
  ScanLine,
  TrendingUp,
  Shield,
  Loader2,
  ArrowLeft,
  Pencil,
  Camera,
  Save,
  RotateCcw,
  Settings as SettingsIcon,
  User as UserIcon,
  Sparkles,
  MessageCircle,
  CalendarDays,
  History as HistoryIcon,
  GraduationCap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { MobileShell } from "@/components/MobileShell";
import { useAuth } from "@/hooks/useAuth";
import { getAdminStats } from "@/lib/admin.functions";
import { getFeatureUsage } from "@/lib/feature-usage.functions";
import { loadFounder, saveFounder, resetFounder, type FounderContent } from "@/lib/founder-content";
import { ProSubscriptionsAdmin } from "@/components/ProSubscriptionsAdmin";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({ component: AdminPage });

type Stats = {
  total_users: number;
  last_signup?: string | null;
  total_scans: number;
  scans_last_7d: { day: string; count: number }[];
  signups_last_7d: { day: string; count: number }[];
  top_products: { name: string; count: number }[];
};

function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchAdminStats = useServerFn(getAdminStats);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
    (async () => {
      const allowed = user?.email?.toLowerCase() === "omar.soliman.092@gmail.com";
      if (!allowed) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsAdmin(true);
      try {
        const s = await fetchAdminStats();
        setStats(s as Stats);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load admin stats");
      }
      setLoading(false);
    })();
  }, [fetchAdminStats, isAuthenticated, isLoading, user, navigate]);

  if (loading) {
    return (
      <MobileShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </MobileShell>
    );
  }

  if (isAdmin === false) {
    return (
      <MobileShell>
        <div className="flex flex-col items-center text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-destructive/15 flex items-center justify-center mb-4">
            <Shield className="w-7 h-7 text-destructive" />
          </div>
          <h2 className="text-xl font-bold mb-2">Access denied</h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-xs">
            This area is restricted to administrators.
          </p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="h-11 px-5 rounded-2xl border border-border text-sm font-semibold"
          >
            Back home
          </button>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <button
        onClick={() => navigate({ to: "/settings" })}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>

      <header className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live metrics for SoSkin — investor & partner ready
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          icon={Users}
          label="Total users"
          value={stats?.total_users ?? 0}
          accent="from-primary to-primary-glow"
        />
        <StatCard
          icon={ScanLine}
          label="Scans performed"
          value={stats?.total_scans ?? 0}
          accent="from-accent to-primary"
        />
      </div>

      <ChartCard title="Scans — last 7 days" icon={TrendingUp}>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={stats?.scans_last_7d ?? []}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
            <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={{ fill: "hsl(var(--primary))", r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Signups — last 7 days" icon={Users}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={stats?.signups_last_7d ?? []}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
            <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Top 5 scanned products" icon={ScanLine}>
        {stats?.top_products?.length ? (
          <div className="space-y-2">
            {stats.top_products.map((p, i) => {
              const max = stats.top_products[0].count || 1;
              const pct = Math.round((p.count / max) * 100);
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium truncate flex-1">
                      {i + 1}. {p.name}
                    </span>
                    <span className="text-primary font-semibold ms-2">{p.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full gradient-primary rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground text-center py-4">
            No scans yet
          </div>
        )}
      </ChartCard>

      <FeatureUsageMonitor />

      <ProSubscriptionsAdmin />

      <FounderEditor />

      <AdminShortcuts />
    </MobileShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: number;
  accent: string;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = display;
    const diff = value - start;
    const duration = 900;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + diff * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <div className="rounded-2xl border border-border gradient-card p-4 relative overflow-hidden">
      <div
        className={`absolute -top-4 -end-4 w-16 h-16 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-xl`}
      />
      <Icon className="w-5 h-5 text-primary mb-2" />
      <div className="text-3xl font-bold tabular-nums">{display.toLocaleString()}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function ChartCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5 rounded-2xl border border-border gradient-card p-4">
      <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
        <Icon className="w-4 h-4 text-primary" />
        {title}
      </div>
      {children}
    </section>
  );
}

function AdminShortcuts() {
  const links = [
    { to: "/edit-profile", icon: UserIcon, label: "Edit my profile" },
    { to: "/settings", icon: SettingsIcon, label: "App settings" },
    { to: "/founder", icon: Sparkles, label: "View founder page" },
    { to: "/chat", icon: MessageCircle, label: "Chat" },
    { to: "/builder", icon: CalendarDays, label: "Routine builder" },
    { to: "/academy", icon: GraduationCap, label: "Academy" },
    { to: "/history", icon: HistoryIcon, label: "History" },
    { to: "/trends", icon: Sparkles, label: "Social Trends" },
  ] as const;
  return (
    <section className="mt-6 mb-4 rounded-2xl border border-border gradient-card p-4">
      <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
        <SettingsIcon className="w-4 h-4 text-primary" />
        Admin quick access
      </div>
      <div className="grid grid-cols-2 gap-2">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all text-xs font-medium"
          >
            <l.icon className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">{l.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FounderEditor() {
  const [c, setC] = useState<FounderContent>(loadFounder);
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upd = <K extends keyof FounderContent>(k: K, v: FounderContent[K]) =>
    setC((p) => ({ ...p, [k]: v }));

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) {
      toast.error("Image too large (max 3MB)");
      return;
    }
    const r = new FileReader();
    r.onload = () => upd("avatarUrl", String(r.result));
    r.readAsDataURL(f);
  };

  const save = () => {
    saveFounder(c);
    toast.success("Founder profile saved");
  };

  const reset = () => {
    if (!confirm("Reset to defaults?")) return;
    resetFounder();
    setC(loadFounder());
    toast.success("Reset to defaults");
  };

  return (
    <section className="mt-6 mb-4 rounded-2xl border border-border gradient-card p-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-sm font-semibold"
      >
        <span className="flex items-center gap-2">
          <Pencil className="w-4 h-4 text-primary" />
          Edit my CV & photo (Founder page)
        </span>
        <span className="text-xs text-muted-foreground">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {/* Photo */}
          <div className="flex items-center gap-4">
            <img
              src={c.avatarUrl}
              alt="Founder avatar preview"
              className="w-20 h-20 rounded-full object-cover border-2 border-primary/40"
            />
            <div className="flex flex-col gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickPhoto}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="h-9 px-3 rounded-xl bg-card border border-border text-xs font-semibold flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" /> Change photo
              </button>
              <p className="text-[10px] text-muted-foreground">PNG/JPG, max 3MB</p>
            </div>
          </div>

          <Field label="Name" value={c.name} onChange={(v) => upd("name", v)} />

          <Field
            label="Bio (English)"
            value={c.bioEn}
            onChange={(v) => upd("bioEn", v)}
            textarea
          />
          <Field
            label="Bio (Arabic)"
            value={c.bioAr}
            onChange={(v) => upd("bioAr", v)}
            textarea
          />

          <ListField
            label="Titles (English)"
            items={c.titlesEn}
            onChange={(v) => upd("titlesEn", v)}
          />
          <ListField
            label="Titles (Arabic)"
            items={c.titlesAr}
            onChange={(v) => upd("titlesAr", v)}
          />

          <ListField
            label="Highlights (English)"
            items={c.highlightsEn}
            onChange={(v) => upd("highlightsEn", v)}
          />
          <ListField
            label="Highlights (Arabic)"
            items={c.highlightsAr}
            onChange={(v) => upd("highlightsAr", v)}
          />

          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2">Stats (4 boxes)</div>
            <div className="space-y-2">
              {c.stats.map((s, i) => (
                <div key={i} className="grid grid-cols-3 gap-1.5">
                  <input
                    className="h-9 rounded-lg bg-card border border-border px-2 text-xs"
                    placeholder="EN label"
                    value={s.labelEn}
                    onChange={(e) => {
                      const next = [...c.stats];
                      next[i] = { ...s, labelEn: e.target.value };
                      upd("stats", next);
                    }}
                  />
                  <input
                    className="h-9 rounded-lg bg-card border border-border px-2 text-xs"
                    placeholder="AR label"
                    value={s.labelAr}
                    onChange={(e) => {
                      const next = [...c.stats];
                      next[i] = { ...s, labelAr: e.target.value };
                      upd("stats", next);
                    }}
                  />
                  <input
                    className="h-9 rounded-lg bg-card border border-border px-2 text-xs"
                    placeholder="Value"
                    value={s.value}
                    onChange={(e) => {
                      const next = [...c.stats];
                      next[i] = { ...s, value: e.target.value };
                      upd("stats", next);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <Field
            label="Instagram URL"
            value={c.instagram}
            onChange={(v) => upd("instagram", v)}
          />
          <Field label="Phone" value={c.phone} onChange={(v) => upd("phone", v)} />

          <div className="flex gap-2 pt-2">
            <button
              onClick={save}
              className="flex-1 h-11 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save
            </button>
            <button
              onClick={reset}
              className="h-11 px-4 rounded-2xl border border-border text-sm flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground mb-1.5">{label}</div>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full rounded-xl bg-card border border-border p-2.5 text-sm outline-none focus:border-primary"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 rounded-xl bg-card border border-border px-3 text-sm outline-none focus:border-primary"
        />
      )}
    </div>
  );
}

function ListField({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground mb-1.5">{label}</div>
      <div className="space-y-1.5">
        {items.map((it, i) => (
          <div key={i} className="flex gap-1.5">
            <input
              value={it}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="flex-1 h-9 rounded-lg bg-card border border-border px-2.5 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="w-9 h-9 rounded-lg border border-border text-muted-foreground text-xs"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() => onChange([...items, ""])}
          className="w-full h-9 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:text-foreground"
        >
          + Add
        </button>
      </div>
    </div>
  );
}

function FeatureUsageMonitor() {
  const fetchUsage = useServerFn(getFeatureUsage);
  const [data, setData] = useState<{ total: number; items: Array<{ key: string; ar: string; en: string; audience: string; count: number; percentage: number }> } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetchUsage();
      setData(r as any);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load feature usage");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="mt-6 mb-4 rounded-2xl border border-border gradient-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <BarChart3 className="w-4 h-4 text-primary" />
          Feature Usage Monitor
          <span className="text-[10px] text-muted-foreground font-normal">(last 30d)</span>
        </div>
        <button
          onClick={load}
          className="text-[11px] text-primary hover:underline disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "…" : "Refresh"}
        </button>
      </div>

      {loading && !data ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : !data || data.total === 0 ? (
        <div className="text-xs text-muted-foreground text-center py-4">
          No feature usage tracked yet.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-[11px] text-muted-foreground">
            Total interactions: <span className="text-foreground font-semibold">{data.total}</span>
          </div>
          {data.items.map((item) => (
            <div key={item.key}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium truncate flex-1">
                  {item.en}
                  <span className="text-muted-foreground ms-1.5">• {item.ar}</span>
                  <span className={`ms-2 inline-block text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                    item.audience === "expert"
                      ? "bg-amber-500/15 text-amber-400"
                      : item.audience === "customer"
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {item.audience}
                  </span>
                </span>
                <span className="text-primary font-semibold ms-2 tabular-nums shrink-0">
                  {item.percentage.toFixed(1)}% · {item.count}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full gradient-primary rounded-full transition-all"
                  style={{ width: `${Math.min(100, item.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
