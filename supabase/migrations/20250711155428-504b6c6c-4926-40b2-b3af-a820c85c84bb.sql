-- Create companies for existing users who don't have any
DO $$
DECLARE
    user_record RECORD;
    default_company_id UUID;
BEGIN
    -- Loop through all users who don't have companies
    FOR user_record IN 
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN public.company_members cm ON au.id = cm.user_id
        WHERE cm.user_id IS NULL
    LOOP
        -- Create a company for each user
        INSERT INTO public.companies (name, slug, created_by)
        VALUES (
            COALESCE(user_record.raw_user_meta_data ->> 'company', user_record.email || '''s Company'),
            LOWER(REPLACE(COALESCE(user_record.raw_user_meta_data ->> 'company', user_record.email), ' ', '-')) || '-' || EXTRACT(EPOCH FROM now())::TEXT,
            user_record.id
        ) RETURNING id INTO default_company_id;
        
        -- Add user as owner of their company
        INSERT INTO public.company_members (company_id, user_id, role, status)
        VALUES (default_company_id, user_record.id, 'owner', 'active');
        
        RAISE NOTICE 'Created company % for user %', default_company_id, user_record.email;
    END LOOP;
END $$;