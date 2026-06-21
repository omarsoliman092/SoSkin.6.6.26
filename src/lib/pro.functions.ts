import { createServerFn } from "./server-fn-mock";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Lifetime access for the current version (one-time 200 EGP)
export const PRO_DURATION_DAYS = 36500;
export const TRIAL_DAYS = 14;
const ADMIN_EMAIL = "omar.soliman.092@gmail.com";

function isExpired(_activatedAt: string): boolean {
  return false;
}

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function assertAdmin(email: string | undefined, userId: string) {
  const lower = String(email ?? "").toLowerCase();
  if (lower === ADMIN_EMAIL) return;
  const admin = await getAdmin();
  const { data } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("forbidden");
}

export const getMyProStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabaseAdmin = await getAdmin();
    // Subscription
    const { data, error } = await supabaseAdmin
      .from("pro_subscriptions")
      .select("status, activated_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw error;

    // Trial window — derived from auth.users.created_at on the server (source of truth)
    let createdAt: string | null = null;
    try {
      const u = await supabaseAdmin.auth.admin.getUserById(context.userId);
      createdAt = u.data.user?.created_at ?? null;
      createdAt = u.data.user?.created_at ?? null;
    } catch {
      createdAt = null;
    }
    const nowMs = Date.now();
    let isTrialActive = false;
    let trialDaysLeft = 0;
    let trialEndsAt: string | null = null;
    if (createdAt) {
      const end = new Date(createdAt).getTime() + TRIAL_DAYS * 86400000;
      trialEndsAt = new Date(end).toISOString();
      const msLeft = end - nowMs;
      if (msLeft > 0) {
        isTrialActive = true;
        trialDaysLeft = Math.max(1, Math.ceil(msLeft / 86400000));
      }
    }

    if (!data) {
      return {
        isPaidPro: false,
        isPro: isTrialActive,
        status: "none" as const,
        activatedAt: null,
        expiresAt: null,
        isTrialActive,
        trialDaysLeft,
        trialEndsAt,
        serverNow: new Date(nowMs).toISOString(),
      };
    }
    const expired = isExpired(data.activated_at);
    const paidActive = data.status === "active" && !expired;
    const expiresAt = new Date(new Date(data.activated_at).getTime() + PRO_DURATION_DAYS * 86400000).toISOString();
    return {
      isPaidPro: paidActive,
      isPro: paidActive || isTrialActive,
      status: expired ? ("expired" as const) : (data.status as "active" | "revoked"),
      activatedAt: data.activated_at,
      expiresAt,
      isTrialActive,
      trialDaysLeft,
      trialEndsAt,
      serverNow: new Date(nowMs).toISOString(),
    };
  });

export const listProUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.claims.email as string | undefined, context.userId);
    const supabaseAdmin = await getAdmin();


    const usersRes = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersRes.error) throw usersRes.error;

    const { data: subs, error: subsErr } = await supabaseAdmin
      .from("pro_subscriptions")
      .select("user_id, status, activated_at");
    if (subsErr) throw subsErr;

    const { data: profiles } = await supabaseAdmin.from("profiles").select("user_id, role, name");

    const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));
    const subMap = new Map((subs ?? []).map((s) => [s.user_id, s]));

    const ONLINE_WINDOW_MS = 15 * 60 * 1000;
    const now = Date.now();

    return (usersRes.data.users ?? []).map((u) => {
      const sub = subMap.get(u.id);
      const profile = profileMap.get(u.id);
      const expired = sub ? isExpired(sub.activated_at) : false;
      const status: "active" | "revoked" | "expired" | "none" = !sub
        ? "none"
        : expired
        ? "expired"
        : (sub.status as "active" | "revoked");
      const expiresAt = sub
        ? new Date(new Date(sub.activated_at).getTime() + PRO_DURATION_DAYS * 86400000).toISOString()
        : null;
      const lastSignIn = u.last_sign_in_at ? new Date(u.last_sign_in_at).getTime() : 0;
      return {
        id: u.id,
        email: u.email ?? "",
        name: profile?.name ?? "",
        role: (profile?.role === "expert" ? "Expert" : "Consumer") as "Expert" | "Consumer",
        isOnline: lastSignIn > 0 && now - lastSignIn < ONLINE_WINDOW_MS,
        lastSignInAt: u.last_sign_in_at ?? null,
        status,
        activatedAt: sub?.activated_at ?? null,
        expiresAt,
      };
    });
  });

export const setProAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      userId: z.string().uuid(),
      grant: z.boolean(),
    }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.claims.email as string | undefined, context.userId);
    const supabaseAdmin = await getAdmin();


    if (data.grant) {
      const { error } = await supabaseAdmin
        .from("pro_subscriptions")
        .upsert(
          {
            user_id: data.userId,
            status: "active",
            activated_at: new Date().toISOString(),
            granted_by: context.userId,
          },
          { onConflict: "user_id" },
        );
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from("pro_subscriptions")
        .upsert(
          { user_id: data.userId, status: "revoked", activated_at: new Date(0).toISOString() },
          { onConflict: "user_id" },
        );
      if (error) throw error;
    }
    return { ok: true };
  });
