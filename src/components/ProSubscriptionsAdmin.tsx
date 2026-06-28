import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@/lib/server-fn-mock";
import { Users, Radio, Lock, Unlock, Clock, Loader2, Search, Crown } from "lucide-react";
import { listProUsers, setProAccess, PRO_DURATION_DAYS } from "@/lib/pro.functions";
import { toast } from "sonner";

type ProUser = Awaited<ReturnType<typeof listProUsers>>[number];

function formatRemaining(expiresAt: string | null): string {
  if (!expiresAt) return "—";
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  return `${days}d ${hours}h`;
}

const STATUS_COLOR: Record<ProUser["status"], string> = {
  active: "bg-primary/15 text-primary border-primary/30",
  expired: "bg-destructive/15 text-destructive border-destructive/30",
  revoked: "bg-muted text-muted-foreground border-border",
  none: "bg-card text-muted-foreground border-border",
};

export function ProSubscriptionsAdmin() {
  const fetchList = useServerFn(listProUsers);
  const updateAccess = useServerFn(setProAccess);

  const [users, setUsers] = useState<ProUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "active" | "expired">("all");
  const [, force] = useState(0);

  // Tick every 60s so countdowns update
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const load = async () => {
    try {
      const data = await fetchList();
      setUsers(data as ProUser[]);
    } catch (e: any) {
      toast.error(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = async (u: ProUser) => {
    const grant = !(u.status === "active");
    setBusy(u.id);
    try {
      await updateAccess({ data: { userId: u.id, grant } });
      toast.success(grant ? `PRO granted for ${u.email}` : `PRO revoked for ${u.email}`);
      await load();
    } catch (e: any) {
      toast.error(e.message || "Failed to update");
    } finally {
      setBusy(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (q && !u.email.toLowerCase().includes(q) && !u.name.toLowerCase().includes(q)) return false;
      if (filter === "online") return u.isOnline;
      if (filter === "active") return u.status === "active";
      if (filter === "expired") return u.status === "expired";
      return true;
    });
  }, [users, query, filter]);

  const counts = useMemo(
    () => ({
      online: users.filter((u) => u.isOnline).length,
      active: users.filter((u) => u.status === "active").length,
      expired: users.filter((u) => u.status === "expired").length,
    }),
    [users],
  );

  return (
    <section className="mt-6 mb-4 rounded-2xl border border-border gradient-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Crown className="w-4 h-4 text-primary" />
          PRO Subscriptions
        </div>
        <button
          onClick={load}
          className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <MiniStat icon={Radio} label="Online" value={counts.online} accent="text-primary" />
        <MiniStat icon={Unlock} label="Active" value={counts.active} accent="text-primary" />
        <MiniStat icon={Lock} label="Expired" value={counts.expired} accent="text-destructive" />
      </div>

      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by email or name…"
          className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="flex gap-1.5 mb-3">
        {(["all", "online", "active", "expired"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`flex-1 h-8 rounded-lg text-[10px] uppercase font-semibold tracking-wider border ${
              filter === k ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted-foreground">
          <Users className="w-6 h-6 mx-auto mb-2 opacity-50" />
          No users match
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => {
            const active = u.status === "active";
            return (
              <div
                key={u.id}
                className="rounded-xl border border-border bg-card p-3 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${u.isOnline ? "bg-primary animate-pulse" : "bg-muted-foreground/40"}`}
                      />
                      <span className="text-sm font-semibold truncate">{u.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      <span className="px-1.5 py-0.5 rounded bg-muted">{u.role}</span>
                      {u.name && <span className="truncate">{u.name}</span>}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full border ${STATUS_COLOR[u.status]}`}
                  >
                    {u.status}
                  </span>
                </div>

                {u.status === "active" && (
                  <div className="flex items-center gap-1.5 text-[11px] text-primary font-medium">
                    <Clock className="w-3 h-3" />
                    Remaining: {formatRemaining(u.expiresAt)} / {PRO_DURATION_DAYS}d
                  </div>
                )}
                {u.status === "expired" && (
                  <div className="text-[11px] text-destructive font-medium flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> 30-day window ended — re-grant to renew
                  </div>
                )}

                <button
                  onClick={() => toggle(u)}
                  disabled={busy === u.id}
                  className={`h-9 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                    active
                      ? "bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25"
                      : "gradient-primary text-primary-foreground"
                  }`}
                >
                  {busy === u.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : active ? (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Revoke Access
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" /> Grant Access (30 days)
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MiniStat({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number; accent: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center">
      <Icon className={`w-4 h-4 mx-auto mb-1 ${accent}`} />
      <div className="text-xl font-bold tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}
