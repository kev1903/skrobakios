-- Check if there's a trigger on auth.users that calls handle_new_user_role
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE action_statement LIKE '%handle_new_user_role%';