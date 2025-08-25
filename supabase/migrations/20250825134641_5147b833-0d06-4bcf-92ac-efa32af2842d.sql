-- Add all superadmins to all existing companies as owners
DO $$
DECLARE
  superadmin_record RECORD;
  company_record RECORD;
BEGIN
  -- Loop through all superadmins
  FOR superadmin_record IN 
    SELECT user_id 
    FROM public.user_roles 
    WHERE role = 'superadmin'
  LOOP
    -- Loop through all companies
    FOR company_record IN 
      SELECT id 
      FROM public.companies
    LOOP
      -- Insert superadmin as owner if not already a member
      INSERT INTO public.company_members (company_id, user_id, role, status, created_at, updated_at)
      VALUES (
        company_record.id, 
        superadmin_record.user_id, 
        'owner', 
        'active',
        now(),
        now()
      )
      ON CONFLICT (company_id, user_id) DO NOTHING; -- Skip if already exists
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Successfully added all superadmins to all existing companies';
END $$;