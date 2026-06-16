CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.customer_lookups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id UUID NOT NULL,
  phone TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  age_range TEXT NOT NULL DEFAULT '',
  skin_type TEXT NOT NULL DEFAULT '',
  concerns TEXT[] NOT NULL DEFAULT '{}'::text[],
  last_products TEXT[] NOT NULL DEFAULT '{}'::text[],
  notes TEXT NOT NULL DEFAULT '',
  last_visit DATE NOT NULL DEFAULT ((now() AT TIME ZONE 'utc'::text))::date,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (expert_id, phone)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_lookups TO authenticated;
GRANT ALL ON public.customer_lookups TO service_role;

ALTER TABLE public.customer_lookups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Experts read own lookups" ON public.customer_lookups
FOR SELECT TO authenticated USING (auth.uid() = expert_id);

CREATE POLICY "Experts insert own lookups" ON public.customer_lookups
FOR INSERT TO authenticated WITH CHECK (auth.uid() = expert_id);

CREATE POLICY "Experts update own lookups" ON public.customer_lookups
FOR UPDATE TO authenticated USING (auth.uid() = expert_id) WITH CHECK (auth.uid() = expert_id);

CREATE POLICY "Experts delete own lookups" ON public.customer_lookups
FOR DELETE TO authenticated USING (auth.uid() = expert_id);

CREATE INDEX customer_lookups_expert_phone_idx ON public.customer_lookups (expert_id, phone);

CREATE TRIGGER customer_lookups_updated_at
BEFORE UPDATE ON public.customer_lookups
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();