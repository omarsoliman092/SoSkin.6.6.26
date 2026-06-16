import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ADMIN_EMAIL = "omar.soliman.092@gmail.com";

type DayCount = { day: string; count: number };
type TopProduct = { name: string; count: number };

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = String(context.claims.email ?? "").toLowerCase();
    if (email !== ADMIN_EMAIL) {
      throw new Error("forbidden");
    }

    const usersRes = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersRes.error) throw usersRes.error;
    const users = usersRes.data.users ?? [];
    const totalUsers = usersRes.data.total || users.length;
    const lastSignup = users
      .map((u) => u.created_at)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null;

    const { count: totalScans, error: scansCountError } = await supabaseAdmin
      .from("scans")
      .select("id", { count: "exact", head: true });
    if (scansCountError) throw scansCountError;

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentScans, error: recentError } = await supabaseAdmin
      .from("scans")
      .select("created_at, product_name")
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .limit(10000);
    if (recentError) throw recentError;

    const { data: productRows, error: productsError } = await supabaseAdmin
      .from("scans")
      .select("product_name")
      .neq("product_name", "")
      .limit(10000);
    if (productsError) throw productsError;

    const scansByDay = lastSevenDays();
    for (const row of recentScans ?? []) {
      const day = String(row.created_at).slice(0, 10);
      if (day in scansByDay) scansByDay[day] += 1;
    }

    const signupsByDay = lastSevenDays();
    for (const user of users) {
      const day = String(user.created_at).slice(0, 10);
      if (day in signupsByDay) signupsByDay[day] += 1;
    }

    const productCounts = new Map<string, number>();
    for (const row of productRows ?? []) {
      const name = String(row.product_name ?? "").trim();
      if (!name) continue;
      productCounts.set(name, (productCounts.get(name) ?? 0) + 1);
    }

    return {
      total_users: totalUsers,
      last_signup: lastSignup,
      total_scans: totalScans ?? 0,
      scans_last_7d: toDayCounts(scansByDay),
      signups_last_7d: toDayCounts(signupsByDay),
      top_products: [...productCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count })) satisfies TopProduct[],
    };
  });

export const ensureAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = String(context.claims.email ?? "").toLowerCase();
    if (email !== ADMIN_EMAIL) return { ok: false };
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: context.userId, role: "admin" }, { onConflict: "user_id,role", ignoreDuplicates: true });
    if (error) throw error;
    return { ok: true };
  });

function lastSevenDays(): Record<string, number> {
  const days: Record<string, number> = {};
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    days[date.toISOString().slice(0, 10)] = 0;
  }
  return days;
}

function toDayCounts(days: Record<string, number>): DayCount[] {
  return Object.entries(days).map(([day, count]) => ({ day, count }));
}