-- Remove automatic company creation for new users
DROP TRIGGER IF EXISTS on_auth_user_created_assign_company ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_company();