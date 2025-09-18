-- Let's temporarily disable the triggers on auth.users to test
-- First, let's see what happens if we disable the auto-company creation trigger

ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created_assign_company;