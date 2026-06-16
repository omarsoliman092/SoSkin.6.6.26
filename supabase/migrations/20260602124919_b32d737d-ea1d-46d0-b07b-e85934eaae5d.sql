
CREATE TABLE public.feature_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  feature_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_feature_events_feature_key ON public.feature_events(feature_key);
CREATE INDEX idx_feature_events_created_at ON public.feature_events(created_at DESC);
CREATE INDEX idx_feature_events_user_id ON public.feature_events(user_id);

GRANT SELECT, INSERT ON public.feature_events TO authenticated;
GRANT ALL ON public.feature_events TO service_role;

ALTER TABLE public.feature_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own feature events"
ON public.feature_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own feature events"
ON public.feature_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins read all feature events"
ON public.feature_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
