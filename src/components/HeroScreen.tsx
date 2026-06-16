import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X, Sparkles, ArrowRight, Camera } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { MobileShell } from "@/components/MobileShell";
import { ContextualTooltip, bumpSession } from "@/components/ContextualTooltip";
import { SoskinWordmark } from "@/components/SoskinWordmark";

const HERO_DISMISSED = "soskin_hero_dismissed";

interface Props {
  onDismiss: () => void;
}

/**
 * HeroScreen — minimalist intent-based landing.
 * Logo + dynamic primary CTA + secondary link to /tools.
 * Dismissible (persisted via localStorage).
 */
export function HeroScreen({ onDismiss }: Props) {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const ar = profile.lang === "ar";

  // Dynamic CTA — primary intent is to analyze
  const cta = ar ? "صور منتجك واعرف مكوناته" : "Start analysis";
  const secondary = ar ? "الدخول للقائمة" : "All tools";
  const tagline = ar ? "مستشارك الذكي للعناية بالبشرة" : "Smarter skin. Clearer choices.";

  useEffect(() => {
    bumpSession();
  }, []);

  return (
    <MobileShell>
      <div className="min-h-[85vh] flex flex-col items-center justify-center text-center relative animate-float-up">
        {/* Dismiss */}
        <button
          onClick={() => {
            localStorage.setItem(HERO_DISMISSED, "1");
            onDismiss();
          }}
          aria-label={ar ? "إخفاء" : "Dismiss"}
          className="absolute top-2 end-2 w-9 h-9 rounded-full glass border border-primary/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/60 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Wordmark — Tiffany serif brand */}
        <SoskinWordmark size="xl" asLink={false} className="!tracking-[0.4em]" />
        <div className="h-px w-20 bg-foreground/30 mt-5" />
        <p className="text-[11px] tracking-[0.4em] uppercase text-foreground/70 mt-5 font-medium">
          {tagline}
        </p>

        {/* Primary CTAs */}
        <div className="relative mt-10 w-full max-w-xs space-y-3">
          <button
            onClick={() => navigate({ to: "/scan", search: { tab: "face" } })}
            className="w-full h-14 rounded-2xl gradient-aurora text-primary-foreground font-semibold text-base shadow-glow hover:shadow-card transition-all flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            {ar ? "اعرف نوع بشرتك" : "Know your skin type"}
          </button>
          <button
            onClick={() => navigate({ to: "/quick-scan" })}
            className="w-full h-14 rounded-2xl gradient-primary text-primary-foreground font-semibold text-base shadow-glow hover:shadow-card transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {cta}
          </button>
          <ContextualTooltip id="hero-cta" label={ar ? "اضغط" : "Tap"} position="bottom" />
        </div>

        {/* Secondary link → tools */}
        <Link
          to="/tools"
          className="mt-5 inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-glow transition font-medium"
        >
          {secondary}
          <ArrowRight className={`w-4 h-4 ${ar ? "rotate-180" : ""}`} />
        </Link>
      </div>
    </MobileShell>
  );
}

export function useHeroDismissed() {
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  useEffect(() => {
    setDismissed(localStorage.getItem(HERO_DISMISSED) === "1");
  }, []);
  return [dismissed, setDismissed] as const;
}
