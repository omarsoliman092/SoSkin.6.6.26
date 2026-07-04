import { type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Globe, LogIn, LogOut, Moon, Shield, Sparkles, Sun } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { usePaywall } from "@/hooks/usePaywall";
import { useTheme } from "@/hooks/useTheme";
import { PricingPaywallModal } from "@/components/PricingPaywallModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SoskinWordmark } from "@/components/SoskinWordmark";
import { STRINGS } from "@/lib/strings";

const ADMIN_EMAIL = "omar.soliman.092@gmail.com";

export function MobileShell({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { profile, update } = useProfile();
  const { isTrialActive, trialDaysLeft, isPaidPro, paywallOpen, paywallExpert, openPaywall, closePaywall } = usePaywall();
  const { theme, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;
  const isExpert = profile.role === "expert";
  const toggleLang = () => update({ lang: profile.lang === "ar" ? "en" : "ar" });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* SOSKIN wordmark watermark — stronger in light mode */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        <SoskinWordmark size="xl" asLink={false} className="watermark-wordmark !text-[22vw] sm:!text-[18vw] md:!text-[14vw] lg:!text-[10vw] !tracking-[0.3em]" />
      </div>
      <div className="relative max-w-md mx-auto pb-28 px-4 pt-[max(1rem,env(safe-area-inset-top))]">


        {/* Permanent brand banner — value proposition always visible */}
        <div
          dir={profile.lang === "ar" ? "rtl" : "ltr"}
          className="mb-3 rounded-2xl border border-primary/40 bg-card/60 backdrop-blur px-4 py-2 text-center shadow-card"
        >
          <div className="text-[11px] font-semibold tracking-[0.3em] text-primary uppercase">
            {STRINGS.banner.title[profile.lang]}
          </div>
          <div className="text-[10px] text-foreground/70 mt-0.5">
            {STRINGS.banner.subtitle[profile.lang]}
          </div>
        </div>




        {!isLoading && (
          <div className="flex items-center justify-end gap-2 mb-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              data-tour="theme-toggle"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-semibold"
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={toggleLang}
              aria-label="Toggle language"
              data-tour="lang-toggle"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-semibold"
            >
              <Globe className="w-3.5 h-3.5" />
              {profile.lang === "ar" ? "EN" : "ع"}
            </button>
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-medium"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-destructive/40 text-destructive text-xs font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full gradient-primary text-primary-foreground text-xs font-medium"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign in
              </Link>
            )}
          </div>
        )}

        {isAuthenticated && isTrialActive && !isPaidPro && (
          <button
            onClick={() => openPaywall(isExpert)}
            dir={profile.lang === "ar" ? "rtl" : "ltr"}
            className="w-full mb-3 flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-gradient-to-l from-primary/15 to-transparent px-4 py-2.5 text-primary hover:opacity-90 transition-opacity"
          >
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              {STRINGS.trial.label[profile.lang]}
            </span>
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground shrink-0">
              {STRINGS.trial.remaining[profile.lang](trialDaysLeft)}
            </span>
          </button>
        )}

        {children}
      </div>
      <PricingPaywallModal isOpen={paywallOpen} onClose={closePaywall} isExpertModel={paywallExpert} />
    </div>
  );
}
