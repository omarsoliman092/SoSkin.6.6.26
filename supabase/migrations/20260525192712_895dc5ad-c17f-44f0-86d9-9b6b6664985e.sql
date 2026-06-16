
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'customer',
  lang text NOT NULL DEFAULT 'en',
  gender text NOT NULL DEFAULT 'female',
  recommend_for text NOT NULL DEFAULT 'female',
  skin_type text NOT NULL DEFAULT '',
  combination_zone text NOT NULL DEFAULT '',
  concerns text[] NOT NULL DEFAULT '{}',
  budget text NOT NULL DEFAULT '',
  preference text NOT NULL DEFAULT 'both',
  allergies text NOT NULL DEFAULT '',
  pregnant boolean NOT NULL DEFAULT false,
  favorite_brands text NOT NULL DEFAULT '',
  answer_style text NOT NULL DEFAULT 'quick',
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can insert their own profile
create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;

-- Trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
