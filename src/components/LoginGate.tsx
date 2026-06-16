import { X, ShieldCheck } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useProfile } from "@/hooks/useProfile";

interface Props {
  open: boolean;
  onClose: () => void;
  /** ar/en message: what the user is trying to do */
  reason?: { ar: string; en: string };
}

/**
 * LoginGate — polite, benefit-oriented modal triggered when the
 * value-first flow asks to save or view full history.
 */
export function LoginGate({ open, onClose, reason }: Props) {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const ar = profile.lang === "ar";
  if (!open) return null;

  const headline = ar ? "سجّل الدخول لحفظ نتايجك" : "Sign in to save your results";
  const sub =
    reason?.[ar ? "ar" : "en"] ??
    (ar
      ? "سجّل دخولك علشان نحفظ تحليلاتك ونتابع تقدّم بشرتك."
      : "Sign in to save your results and track your progress.");

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-sm bg-card border border-primary/40 rounded-t-3xl sm:rounded-3xl p-6 shadow-glow animate-in slide-in-from-bottom-4 duration-300"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <button
            onClick={onClose}
            aria-label={ar ? "إغلاق" : "Close"}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <h2 className="text-lg font-bold mb-1">{headline}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{sub}</p>
        <div className="flex gap-2">
          <button
            onClick={() => navigate({ to: "/login" })}
            className="flex-1 h-11 rounded-2xl gradient-primary text-primary-foreground font-semibold text-sm shadow-glow"
          >
            {ar ? "تسجيل الدخول" : "Sign in"}
          </button>
          <button
            onClick={() => navigate({ to: "/signup" })}
            className="flex-1 h-11 rounded-2xl border border-primary/40 font-semibold text-sm"
          >
            {ar ? "حساب جديد" : "Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
