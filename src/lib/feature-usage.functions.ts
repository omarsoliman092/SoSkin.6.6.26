import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

const ADMIN_EMAIL = "omar.soliman.092@gmail.com";

export const FEATURE_LABELS: Record<string, { ar: string; en: string; audience: "expert" | "customer" | "all" }> = {
  sos: { ar: "زرار الـ SOS", en: "SOS Button", audience: "all" },
  beauty_pass: { ar: "العميل أمامي / VIP Follow", en: "In-Person Client / VIP Follow", audience: "expert" },
  objections: { ar: "الاعتراضات", en: "Objection Scripts", audience: "expert" },
  simulator: { ar: "محاكي العميل", en: "Client Simulator", audience: "expert" },
  whatsapp_consult: { ar: "واتساب الاستشارات", en: "WhatsApp Consultations", audience: "expert" },
  before_after_expert: { ar: "قبل وبعد (خبراء)", en: "Before/After (Expert)", audience: "expert" },
  progress: { ar: "قبل وبعد (الشخصي)", en: "Personal Progress", audience: "customer" },
  conflicts: { ar: "تعارضات", en: "Ingredient Conflicts", audience: "customer" },
  expiry: { ar: "منبه انتهاء الصلاحية", en: "PAO Expiry Alarm", audience: "customer" },
  dupes: { ar: "بدائل", en: "Smart Dupes", audience: "customer" },
};

export const logFeatureEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ feature_key: z.string().min(1).max(64) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { error } = await supabaseAdmin.from("feature_events").insert({
      user_id: context.userId,
      feature_key: data.feature_key,
    });
    if (error) throw error;
    return { ok: true };
  });

export const getFeatureUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = String(context.claims.email ?? "").toLowerCase();
    if (email !== ADMIN_EMAIL) {
      const { data: role } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", context.userId)
        .eq("role", "admin")
        .maybeSingle();
      if (!role) throw new Error("forbidden");
    }

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabaseAdmin
      .from("feature_events")
      .select("feature_key")
      .gte("created_at", since)
      .limit(50000);
    if (error) throw error;

    const counts = new Map<string, number>();
    let total = 0;
    for (const row of data ?? []) {
      const key = String(row.feature_key);
      counts.set(key, (counts.get(key) ?? 0) + 1);
      total += 1;
    }

    // Include all known features even with 0 usage
    const result = Object.keys(FEATURE_LABELS).map((key) => {
      const count = counts.get(key) ?? 0;
      const percentage = total > 0 ? (count / total) * 100 : 0;
      return {
        key,
        ar: FEATURE_LABELS[key].ar,
        en: FEATURE_LABELS[key].en,
        audience: FEATURE_LABELS[key].audience,
        count,
        percentage: Math.round(percentage * 10) / 10,
      };
    }).sort((a, b) => b.count - a.count);

    return { total, items: result };
  });
