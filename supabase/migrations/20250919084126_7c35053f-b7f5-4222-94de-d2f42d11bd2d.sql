-- Test the complete user creation flow in the database
-- This simulates what the edge function does

-- 1. Test generating a profile slug
SELECT public.generate_slug('David Labrooy') as profile_slug_test;

-- 2. Test generating a company slug  
SELECT public.generate_slug('Test Business Company') as company_slug_test;

-- 3. Check if we can create a test profile entry (rollback after test)
BEGIN;
  -- Test insert (will rollback)
  INSERT INTO profiles (user_id, email, first_name, last_name, status)
  VALUES (gen_random_uuid(), 'test@example.com', 'Test', 'User', 'active');
  
  SELECT 'Profile insert test: SUCCESS' as test_result;
ROLLBACK;

-- 4. Test role assignment
BEGIN;
  -- Test role insert (will rollback)
  INSERT INTO user_roles (user_id, role)
  VALUES (gen_random_uuid(), 'business_admin');
  
  SELECT 'Role assignment test: SUCCESS' as test_result;
ROLLBACK;

-- 5. Test company member assignment
BEGIN;
  -- Test company member insert (will rollback)
  INSERT INTO company_members (company_id, user_id, role, status)
  VALUES (
    (SELECT id FROM companies LIMIT 1),
    gen_random_uuid(), 
    'admin', 
    'active'
  );
  
  SELECT 'Company member assignment test: SUCCESS' as test_result;
ROLLBACK;