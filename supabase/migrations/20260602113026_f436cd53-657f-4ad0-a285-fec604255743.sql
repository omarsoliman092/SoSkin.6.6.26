-- Lock down SECURITY DEFINER functions in the public schema to prevent
-- unauthenticated/anon execution and role-probing enumeration.

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.admin_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_stats() TO authenticated, service_role;

-- assign_role_on_signup is a trigger function; it should not be directly callable.
REVOKE EXECUTE ON FUNCTION public.assign_role_on_signup() FROM PUBLIC, anon, authenticated;

-- Explicitly forbid UPDATE on user_roles for everyone (defense-in-depth so
-- nobody can ever escalate their own role even if a permissive policy is
-- accidentally added later).
DROP POLICY IF EXISTS "No one can update roles" ON public.user_roles;
CREATE POLICY "No one can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);