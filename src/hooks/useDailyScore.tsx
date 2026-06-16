import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DailyLog {
  log_date: string;
  completed_steps: number;
  total_steps: number;
  score: number;
}

export function useDailyScore() {
  const { user, isAuthenticated } = useAuth();
  const [today, setToday] = useState<DailyLog | null>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().slice(0, 10);

  const load = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("daily_logs")
      .select("log_date, completed_steps, total_steps, score")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false })
      .limit(60);

    const rows = (data ?? []) as DailyLog[];
    const t = rows.find((r) => r.log_date === todayStr) ?? null;
    setToday(t);

    // streak: consecutive days from today backwards with score >= 20
    let s = 0;
    const set = new Set(rows.filter((r) => r.score >= 20).map((r) => r.log_date));
    const d = new Date();
    while (set.has(d.toISOString().slice(0, 10))) {
      s++;
      d.setDate(d.getDate() - 1);
    }
    setStreak(s);
    setLoading(false);
  }, [user, isAuthenticated, todayStr]);

  useEffect(() => {
    load();
  }, [load]);

  const checkIn = useCallback(
    async (completed: number, total: number) => {
      if (!user) return;
      const score = total > 0 ? Math.round((completed / total) * 100) : 0;
      await supabase.from("daily_logs").upsert(
        {
          user_id: user.id,
          log_date: todayStr,
          completed_steps: completed,
          total_steps: total,
          score,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,log_date" },
      );
      await load();
    },
    [user, todayStr, load],
  );

  return { today, streak, loading, checkIn, refresh: load };
}
