-- Fix the handle_new_user_role function to use valid enum values
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Assign default 'company_admin' role to new users (corrected from 'user')
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'company_admin');
  
  RETURN NEW;
END;
$function$;