import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    if (!userId) throw new Error("Not authenticated");

    // Best-effort cleanup of user-owned rows. Ignore errors per table so a
    // missing table never blocks account deletion.
    const tables = ["scans", "user_roles", "profiles"] as const;
    for (const t of tables) {
      try {
        await supabaseAdmin.from(t).delete().eq("user_id", userId);
      } catch {}
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;
    return { ok: true };
  });
