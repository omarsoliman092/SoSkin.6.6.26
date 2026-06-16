CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT private.has_role(_user_id, _role)
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Admins read all roles" ON public.user_roles;
CREATE POLICY "Admins read all roles" ON public.user_roles
FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins read all scans" ON public.scans;
CREATE POLICY "Admins read all scans" ON public.scans
FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.admin_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT private.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'last_signup', (SELECT to_char(MAX(created_at), 'YYYY-MM-DD HH24:MI') FROM auth.users),
    'total_scans', (SELECT COUNT(*) FROM public.scans),
    'scans_last_7d', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('day', day, 'count', c) ORDER BY day), '[]'::jsonb)
      FROM (
        SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, COUNT(*) AS c
        FROM public.scans
        WHERE created_at >= now() - interval '7 days'
        GROUP BY 1
        ORDER BY 1
      ) t
    ),
    'top_products', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('name', product_name, 'count', c) ORDER BY c DESC), '[]'::jsonb)
      FROM (
        SELECT product_name, COUNT(*) AS c
        FROM public.scans
        WHERE product_name <> ''
        GROUP BY product_name
        ORDER BY c DESC
        LIMIT 5
      ) t
    ),
    'signups_last_7d', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('day', day, 'count', c) ORDER BY day), '[]'::jsonb)
      FROM (
        SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, COUNT(*) AS c
        FROM auth.users
        WHERE created_at >= now() - interval '7 days'
        GROUP BY 1
        ORDER BY 1
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_stats() TO authenticated;