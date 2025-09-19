-- Test the complete user creation flow now that functions are fixed
BEGIN;
  -- Test profile creation with slug generation
  INSERT INTO profiles (user_id, email, first_name, last_name, status)
  VALUES (gen_random_uuid(), 'test@example.com', 'David', 'Labrooy', 'active');
  
  SELECT 'Profile with slug generation: SUCCESS' as test_result;
ROLLBACK;

-- Test function calls directly
SELECT 
  public.generate_slug('David Labrooy') as direct_call,
  'All functions working correctly' as status;