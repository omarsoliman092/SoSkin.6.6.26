import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { tr, type Role, type Lang, DEFAULT_PROFILE } from "@/lib/profile";
import { Globe, Sparkles, RotateCcw, LogIn, LogOut, User, Pencil, BarChart3, Shield, FileText, Trash2, Flame, LayoutGrid, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ALL_TOOLS } from "@/lib/tools";


export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const { profile, update, setProfile, ready } = useProfile();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const t = tr(profile.lang);
  if (!ready) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate({ to: "/" });
  };

  return (
    <>
      <MobileShell>
        <h1 className="text-2xl font-bold mb-5">{t.settings}</h1>

        <Link
          to="/edit-profile"
          className="mb-5 flex items-center gap-3 rounded-2xl gradient-card border border-border p-4 hover:border-primary/50 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Pencil className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{t.edit}</div>
            <div className="text-xs text-muted-foreground">
              {profile.lang === "ar"
                ? "حدّث بشرتك، مخاوفك، ميزانيتك — AI يتكيف فورًا"
                : "Update skin, concerns, budget — AI adapts instantly"}
            </div>
          </div>
          <span className="text-muted-foreground">›</span>
        </Link>

        {isAuthenticated && user?.email?.toLowerCase() === "omar.soliman.092@gmail.com" && (
          <Link
            to="/admin"
            className="mb-5 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 hover:border-primary/60 transition-all"
          >
            <div className="w-10 h-10 rounded-xl gradient-aurora flex items-center justify-center shadow-glow">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">
                {profile.lang === "ar" ? "لوحة المطوّر" : "Admin Dashboard"}
              </div>
              <div className="text-xs text-muted-foreground">
                {profile.lang === "ar"
                  ? "إحصائيات حية للمستخدمين والفحوصات"
                  : "Live stats for users & scans"}
              </div>
            </div>
            <span className="text-muted-foreground">›</span>
          </Link>
        )}


        {/* Auth section */}
        <div className="rounded-2xl gradient-card border border-border p-4 mb-5">
          {isAuthenticated ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{user?.email}</div>
                  <div className="text-xs text-muted-foreground">{profile.lang === "ar" ? "متصل" : "Signed in"}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-destructive/40 text-destructive text-xs font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                {profile.lang === "ar" ? "خروج" : "Sign out"}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <LogIn className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{profile.lang === "ar" ? "تسجيل الدخول" : "Sign in"}</div>
                  <div className="text-xs text-muted-foreground">{profile.lang === "ar" ? "احفظ بياناتك ومفضلاتك" : "Save your data & favorites"}</div>
                </div>
              </div>
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-medium"
              >
                <LogIn className="w-3.5 h-3.5" />
                {profile.lang === "ar" ? "دخول" : "Sign in"}
              </Link>
            </div>
          )}
        </div>

        <Section title={t.language} icon={Globe}>
          <div className="grid grid-cols-2 gap-2">
            {(["en", "ar"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => update({ lang: l })}
                className={`p-3 rounded-xl border text-sm ${
                  profile.lang === l ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                {l === "en" ? "English" : "العربية"}
              </button>
            ))}
          </div>
        </Section>

        <Section title={t.role} icon={Sparkles}>
          <div className="grid gap-2">
            {(["customer", "expert"] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => update({ role: r })}
                className={`p-3 rounded-xl border text-start ${
                  profile.role === r ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <div className="font-medium text-sm">{t[r]}</div>
                <div className="text-xs text-muted-foreground">{t[`${r}Desc` as "customerDesc" | "expertDesc"]}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* Smart Tools visibility manager */}
        <Section title={profile.lang === "ar" ? "تنظيم الأدوات الذكية" : "Smart Tools"} icon={LayoutGrid}>
          <p className="text-xs text-muted-foreground mb-2">
            {profile.lang === "ar" ? "اختر الأدوات اللي تظهر في الرئيسية." : "Choose which tools appear on Home."}
          </p>
          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            {ALL_TOOLS.filter((t) => !t.expert || profile.role === "expert").map((tool) => {
              const hidden = (profile.hiddenTools ?? []).includes(tool.key);
              const toggle = () => {
                if (tool.alwaysOn) return;
                const cur = profile.hiddenTools ?? [];
                update({ hiddenTools: hidden ? cur.filter((k) => k !== tool.key) : [...cur, tool.key] });
              };
              return (
                <button
                  key={tool.key}
                  onClick={toggle}
                  disabled={tool.alwaysOn}
                  className="w-full flex items-center gap-3 px-4 py-3 text-start hover:bg-card/60 disabled:opacity-60"
                >
                  <tool.icon className="w-4 h-4 text-primary" />
                  <span className="flex-1 text-sm">{tool.label[profile.lang]}</span>
                  {tool.alwaysOn ? (
                    <span className="text-[10px] text-muted-foreground">{profile.lang === "ar" ? "ثابت" : "always"}</span>
                  ) : hidden ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Roast / Praise / Off — Floated Card mode */}
        <Section title={profile.lang === "ar" ? "بطاقة المتابعة العائمة" : "Floated Coach Card"} icon={Flame}>
          <div className="grid grid-cols-3 gap-2">
            {(["roast", "praise", "off"] as const).map((m) => (
              <button
                key={m}
                onClick={() => update({ roastMode: m })}
                className={`p-3 rounded-xl border text-sm font-medium ${
                  profile.roastMode === m ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                {m === "roast" ? (profile.lang === "ar" ? "روست 🔥" : "Roast 🔥") : m === "praise" ? (profile.lang === "ar" ? "مدح 💖" : "Praise 💖") : (profile.lang === "ar" ? "إيقاف" : "Off")}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            {profile.lang === "ar" ? "حد أقصى 3 رسائل/يوم (صباح، ظهر، ليل)." : "Up to 3 messages/day (morning, mid-day, night)."}
          </p>
        </Section>

        <button
          onClick={() => {
            setProfile({ ...DEFAULT_PROFILE });
            toast.success(profile.lang === "ar" ? "تمت إعادة الضبط" : "Reset complete");
          }}
          className="w-full mt-4 h-12 rounded-2xl border border-destructive/40 text-destructive flex items-center justify-center gap-2 text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          {profile.lang === "ar" ? "إعادة تعيين الملف" : "Reset profile"}
        </button>

        {/* Legal & account */}
        <div className="mt-6 mb-3 px-1 text-[11px] tracking-[0.25em] uppercase text-muted-foreground font-semibold">
          {profile.lang === "ar" ? "قانوني وحساب" : "Legal & Account"}
        </div>
        <div className="rounded-2xl gradient-card border border-border divide-y divide-border overflow-hidden">
          <LegalRow to="/terms" icon={FileText} label={profile.lang === "ar" ? "الشروط والأحكام" : "Terms & Conditions"} />
          <LegalRow to="/privacy" icon={Shield} label={profile.lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"} />
          {isAuthenticated && (
            <LegalRow to="/delete-account" icon={Trash2} label={profile.lang === "ar" ? "حذف الحساب" : "Delete Account"} danger />
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          SoSkin v1.0 • {profile.lang === "ar" ? "تم تطويره بواسطة عمر سليمان" : "Developed by Omar Soliman"}
        </p>
      </MobileShell>
      <BottomNav />
    </>
  );
}


function Section({ title, icon: Icon, children }: any) {
  return (
    <section className="mb-5">
      <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
        <Icon className="w-4 h-4" />
        {title}
      </div>
      {children}
    </section>
  );
}

function LegalRow({ to, icon: Icon, label, danger }: { to: string; icon: any; label: string; danger?: boolean }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-3.5 hover:bg-card/60 transition-colors">
      <Icon className={`w-4 h-4 ${danger ? "text-destructive" : "text-primary"}`} />
      <span className={`text-sm flex-1 ${danger ? "text-destructive font-medium" : ""}`}>{label}</span>
      <span className="text-muted-foreground">›</span>
    </Link>
  );
}
