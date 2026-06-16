import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { tr } from "@/lib/profile";
import { Sparkles, User as UserIcon, LogOut, LogIn, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SoskinWordmark } from "@/components/SoskinWordmark";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — SoSkin" },
      { name: "description", content: "Manage your SoSkin profile, skincare preferences, and personalization settings." },
      { property: "og:title", content: "Your Profile — SoSkin" },
      { property: "og:description", content: "Manage your SoSkin profile, skincare preferences, and personalization settings." },
    ],
  }),
  component: ProfilePage,
});


function ProfilePage() {
  const { profile, ready } = useProfile();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const t = tr(profile.lang);
  if (!ready) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success(profile.lang === "ar" ? "تم تسجيل الخروج" : "Signed out");
    navigate({ to: "/login" });
  };

  const zoneLabel = profile.combinationZone
    ? t[profile.combinationZone as "tzone" | "ozone" | "uzone"]
    : "";
  const rows: [string, string][] = [
    [t.role, t[profile.role]],
    [t.recommendFor, t[profile.recommendFor]],
    [t.skinType, profile.skinType ? `${profile.skinType}${zoneLabel ? ` · ${zoneLabel}` : ""}` : "—"],
    [t.concerns, profile.concerns.join(", ") || "—"],
    [t.budget, profile.budget || "—"],
    [t.productPref, t[profile.preference]],
    [t.allergies, profile.allergies || "—"],
    [t.pregnancy, profile.pregnant ? "✓" : "—"],
    [t.favoriteBrands, profile.favoriteBrands || "—"],
    [t.answerStyle, profile.answerStyle === "quick" ? t.quickAnswers : t.detailedExplanation],
  ];

  return (
    <>
      <MobileShell>
        <div className="rounded-3xl gradient-aurora p-6 shadow-glow flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-background/30 backdrop-blur flex items-center justify-center overflow-hidden">
            {profile.avatarDataUrl ? (
              <img src={profile.avatarDataUrl} alt={profile.name ? `${profile.name} profile photo` : "User profile photo"} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-8 h-8 text-primary-foreground" />
            )}
          </div>
          <div className="flex-1">
            <div className="text-primary-foreground/80 text-xs flex items-center gap-1.5">
              <SoskinWordmark size="sm" asLink={false} /> {t[profile.role]}

            </div>
            <h1 className="text-primary-foreground text-2xl font-bold">{profile.name || "SoSkin User"}</h1>
          </div>
          <Link
            to="/edit-profile"
            className="px-3 py-1.5 rounded-full bg-background/30 backdrop-blur text-primary-foreground text-xs font-medium border border-white/20"
          >
            {t.edit}
          </Link>
        </div>

        <div className="mt-5 rounded-2xl gradient-card border border-border divide-y divide-border">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between items-center px-4 py-3 text-sm">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-medium text-end max-w-[60%] truncate">{v}</span>
            </div>
          ))}
        </div>

        <Link
          to="/founder"
          className="mt-5 block rounded-2xl gradient-card border border-border p-4 hover:border-primary/50 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-aurora flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{profile.lang === "ar" ? "عن المؤسس" : "About the Founder"}</div>
              <div className="text-xs text-muted-foreground">Omar Soliman — Creator of SoSkin</div>
            </div>
            <span className="text-muted-foreground">›</span>
          </div>
        </Link>

        {isAuthenticated && user?.email?.toLowerCase() === "omar.soliman.092@gmail.com" && (
          <Link
            to="/admin"
            className="mt-3 block rounded-2xl border border-primary/40 bg-primary/5 p-4 hover:border-primary/70 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-aurora flex items-center justify-center shadow-glow">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">
                  {profile.lang === "ar" ? "لوحة المطوّر" : "Admin Dashboard"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {profile.lang === "ar" ? "إحصائيات حية" : "Live stats"}
                </div>
              </div>
              <span className="text-muted-foreground">›</span>
            </div>
          </Link>
        )}




        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="mt-5 w-full h-12 rounded-2xl border border-destructive/40 text-destructive flex items-center justify-center gap-2 text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" />
            {profile.lang === "ar" ? "تسجيل الخروج 🚪" : "Sign out 🚪"}
          </button>
        ) : (
          <Link
            to="/login"
            className="mt-5 w-full h-12 rounded-2xl gradient-primary text-primary-foreground flex items-center justify-center gap-2 text-sm font-semibold shadow-glow"
          >
            <LogIn className="w-4 h-4" />
            {profile.lang === "ar" ? "تسجيل الدخول" : "Sign in"}
          </Link>
        )}

        {isAuthenticated && user?.email && (
          <p className="mt-3 text-center text-[11px] text-muted-foreground">{user.email}</p>
        )}

        <p className="mt-6 mb-2 text-center text-[11px] text-muted-foreground">
          SoSkin — {profile.lang === "ar" ? "تم تطويره بواسطة عمر سليمان" : "Developed by Omar Soliman"}
        </p>
      </MobileShell>
      <BottomNav />
    </>
  );
}
