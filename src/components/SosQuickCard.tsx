import { Link } from "@tanstack/react-router";
import { ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

/**
 * SOS quick card — same shape as SkinCareStreakSlider but red.
 */
export function SosQuickCard() {
  const { profile } = useProfile();
  const ar = profile.lang === "ar";

  return (
    <Link
      to="/sos"
      className="block rounded-2xl border border-red-500/40 bg-gradient-to-br from-red-500/10 to-red-500/5 p-4 shadow-card hover:shadow-glow transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-500" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500">
            SOS
          </span>
        </div>
        <span className="text-xs font-semibold text-red-500">
          {ar ? "إنقاذ فوري" : "Instant rescue"}
        </span>
      </div>

      <div className="flex items-center gap-1.5 mb-3" aria-hidden>
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-2 rounded-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
            style={{ opacity: 0.4 + (i / 10) }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">
          {ar ? "تهيج • حساسية • حروق • ثوران" : "Irritation • Allergy • Burn • Flare"}
        </span>
        <span className="font-semibold text-red-500 flex items-center gap-0.5">
          {ar ? "افتح" : "Open"} {ar ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </span>
      </div>
    </Link>
  );
}
