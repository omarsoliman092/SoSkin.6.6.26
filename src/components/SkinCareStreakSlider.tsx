import { Flame, CheckCircle2 } from "lucide-react";
import { useDailyScore } from "@/hooks/useDailyScore";
import { useProfile } from "@/hooks/useProfile";

/**
 * SKIN CARE STREAK
 * شريط تقدم التهيئة — يظهر فوق الأزرار في الهوم.
 * 7-day visual streak slider + today's progress bar.
 */
export function SkinCareStreakSlider() {
  const { streak, today } = useDailyScore();
  const { profile } = useProfile();
  const ar = profile.lang === "ar";

  const completed = today?.completed_steps ?? 0;
  const total = Math.max(today?.total_steps ?? 0, 3);
  const todayPct = Math.min(100, Math.round((completed / total) * 100));

  // 7-day visual: last 7 days, mark up to `streak` as done (from the right).
  const days = Array.from({ length: 7 }, (_, i) => i);
  const doneCount = Math.min(streak, 7);

  return (
    <div className="rounded-2xl glass border border-primary/20 p-4 shadow-card hover:shadow-glow transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className={`w-4 h-4 ${streak > 0 ? "text-orange-400" : "text-muted-foreground"}`} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            SKIN CARE STREAK
          </span>
        </div>
        <span className="text-xs font-semibold">
          {streak}
          <span className="text-muted-foreground font-normal"> / 7 {ar ? "أيام" : "days"}</span>
        </span>
      </div>

      {/* 7-day dots track */}
      <div className="flex items-center gap-1.5 mb-3" aria-label="7 day streak">
        {days.map((i) => {
          const isDone = i < doneCount;
          return (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all ${
                isDone
                  ? "bg-gradient-to-r from-orange-500 to-primary shadow-[0_0_8px_rgba(234,88,12,0.5)]"
                  : "bg-muted/40"
              }`}
            />
          );
        })}
      </div>

      {/* Today's routine progress */}
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>
            {ar ? "روتين اليوم" : "Today's routine"}: {completed}/{total}
          </span>
        </div>
        <span className="font-semibold text-primary">{todayPct}%</span>
      </div>
      <div className="mt-1.5 h-1 rounded-full bg-muted/40 overflow-hidden">
        <div
          className="h-full gradient-primary transition-all"
          style={{ width: `${todayPct}%` }}
        />
      </div>
    </div>
  );
}
