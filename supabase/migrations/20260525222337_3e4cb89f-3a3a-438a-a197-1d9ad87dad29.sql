
-- Restrict admin role exclusively to the founder's email
CREATE OR REPLACE FUNCTION public.assign_role_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE
      WHEN lower(NEW.email) = 'omar.soliman.092@gmail.com' THEN 'admin'::public.app_role
      ELSE 'user'::public.app_role
    END
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.assign_role_on_signup();

-- Revoke admin from anyone whose email isn't the founder's
DELETE FROM public.user_roles
WHERE role = 'admin'::public.app_role
  AND user_id NOT IN (
    SELECT id FROM auth.users WHERE lower(email) = 'omar.soliman.092@gmail.com'
  );

-- Grant admin to the founder if they already exist
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) = 'omar.soliman.092@gmail.com'
ON CONFLICT DO NOTHING;
