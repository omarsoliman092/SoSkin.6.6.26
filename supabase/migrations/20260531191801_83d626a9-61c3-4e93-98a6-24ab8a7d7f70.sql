
-- 1. Merge advisor -> expert
UPDATE public.profiles SET role = 'expert' WHERE role = 'advisor';

-- 2. Add hair profile fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hair_porosity text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS hair_concerns text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_skin_id_refresh timestamptz;

-- 3. daily_logs for streak + daily score
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  log_date date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  completed_steps integer NOT NULL DEFAULT 0,
  total_steps integer NOT NULL DEFAULT 0,
  score integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_logs TO authenticated;
GRANT ALL ON public.daily_logs TO service_role;

ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own daily_logs"
  ON public.daily_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own daily_logs"
  ON public.daily_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own daily_logs"
  ON public.daily_logs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own daily_logs"
  ON public.daily_logs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS daily_logs_user_date_idx ON public.daily_logs (user_id, log_date DESC);
