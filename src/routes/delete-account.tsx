import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, AlertTriangle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAccount } from "@/lib/account.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/delete-account")({
  head: () => ({
    meta: [
      { title: "Delete Account — SoSkin" },
      { name: "description", content: "Permanently delete your SoSkin account and data." },
    ],
  }),
  component: DeleteAccountPage,
});

function DeleteAccountPage() {
  const { profile } = useProfile();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const ar = profile.lang === "ar";
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const runDelete = useServerFn(deleteMyAccount);

  const required = "DELETE";
  const canDelete = isAuthenticated && confirm.trim().toUpperCase() === required && !loading;

  const handleDelete = async () => {
    if (!canDelete) return;
    setLoading(true);
    try {
      await runDelete({});
      await supabase.auth.signOut();
      try { localStorage.clear(); } catch {}
      toast.success(ar ? "تم حذف حسابك نهائياً" : "Your account has been deleted");
      navigate({ to: "/" });
    } catch (e: any) {
      toast.error(e?.message ?? (ar ? "تعذّر الحذف" : "Could not delete"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MobileShell>
        <Link to="/settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> {ar ? "رجوع" : "Back"}
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-6 h-6 text-destructive" />
          <h1 className="text-2xl font-bold">{ar ? "حذف الحساب" : "Delete Account"}</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          {ar
            ? "هذا الإجراء نهائي. سيتم حذف حسابك وملفك وكل الفحوصات المرتبطة به ولا يمكن استرجاعها."
            : "This action is permanent. Your account, profile, and all linked scans will be removed and cannot be restored."}
        </p>

        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 mb-5 text-sm">
          <div className="font-semibold mb-2">{ar ? "ما الذي سيُحذف؟" : "What will be deleted?"}</div>
          <ul className="list-disc ms-5 space-y-1 text-foreground/80">
            <li>{ar ? "بيانات تسجيل الدخول والبريد الإلكتروني" : "Login credentials and email"}</li>
            <li>{ar ? "ملف البشرة والتفضيلات" : "Skin profile & preferences"}</li>
            <li>{ar ? "سجل الفحوصات والمحادثات" : "Scan & chat history"}</li>
            <li>{ar ? "الصور المرفوعة" : "Uploaded images"}</li>
          </ul>
        </div>

        {!isAuthenticated ? (
          <Link
            to="/login"
            className="w-full h-12 rounded-2xl gradient-primary text-primary-foreground flex items-center justify-center text-sm font-semibold"
          >
            {ar ? "سجّل الدخول أولاً" : "Sign in first"}
          </Link>
        ) : (
          <>
            <label className="block text-xs text-muted-foreground mb-2">
              {ar ? `اكتب "${required}" للتأكيد` : `Type "${required}" to confirm`}
              {user?.email && <span className="block mt-1">{user.email}</span>}
            </label>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={required}
              className="w-full h-12 rounded-2xl border border-border bg-card px-4 text-sm mb-4 outline-none focus:border-destructive"
            />
            <button
              onClick={handleDelete}
              disabled={!canDelete}
              className="w-full h-12 rounded-2xl bg-destructive text-destructive-foreground flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
              {loading
                ? (ar ? "جارٍ الحذف..." : "Deleting...")
                : (ar ? "احذف حسابي نهائياً" : "Delete my account permanently")}
            </button>
          </>
        )}
      </MobileShell>
      <BottomNav />
    </>
  );
}
