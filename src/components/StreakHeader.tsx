import { Flame, Plus } from "lucide-react";
import { useDailyScore } from "@/hooks/useDailyScore";
import { useProfile } from "@/hooks/useProfile";

export function StreakHeader() {
  const { streak, today, checkIn } = useDailyScore();
  const { profile } = useProfile();
  const ar = profile.lang === "ar";

  const score = today?.score ?? 0;
  const completed = today?.completed_steps ?? 0;
  const total = today?.total_steps ?? 0;

  const quickCheck = async () => {
    // Quick single-step check-in (1 routine step). Idempotent-ish.
    const newTotal = Math.max(total, 3);
    const newCompleted = Math.min(completed + 1, newTotal);
    await checkIn(newCompleted, newTotal);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-card border border-border p-3 shadow-card">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
          <Flame className={`w-5 h-5 ${streak > 0 ? "text-orange-400" : "text-muted-foreground"}`} />
        </div>
        <div>
          <div className="text-lg font-bold leading-none">
            {streak} <span className="text-xs text-muted-foreground font-normal">{ar ? "يوم" : "days"}</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
            {ar ? "متتالية" : "Streak"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-end">
          <div className="text-lg font-bold leading-none text-gradient">
            {score}<span className="text-xs text-muted-foreground font-normal">/100</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
            {ar ? "نتيجة اليوم" : "Today's score"}
          </div>
        </div>
        <button
          onClick={quickCheck}
          className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow active:scale-95 transition-transform"
          aria-label={ar ? "سجّل خطوة" : "Check in step"}
        >
          <Plus className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>
    </div>
  );
}
