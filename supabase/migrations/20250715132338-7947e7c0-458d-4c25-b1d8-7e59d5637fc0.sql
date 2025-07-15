-- Create a company for the current user if they don't have one
DO $$
DECLARE
    user_record RECORD;
    company_id UUID;
BEGIN
    -- Get current user info from auth.users
    SELECT id, email INTO user_record FROM auth.users LIMIT 1;
    
    IF user_record.id IS NOT NULL THEN
        -- Check if user already has a company
        IF NOT EXISTS (
            SELECT 1 FROM company_members cm 
            WHERE cm.user_id = user_record.id 
            AND cm.status = 'active'
        ) THEN
            -- Create a default company for the user
            INSERT INTO companies (name, slug, created_by) 
            VALUES (
                user_record.email || '''s Company',
                LOWER(REPLACE(user_record.email, '@', '-')) || '-' || EXTRACT(EPOCH FROM now())::TEXT,
                user_record.id
            ) RETURNING id INTO company_id;
            
            -- Add user as owner of the company
            INSERT INTO company_members (company_id, user_id, role, status)
            VALUES (company_id, user_record.id, 'owner', 'active');
            
            RAISE NOTICE 'Created company for user: %', user_record.email;
        ELSE
            RAISE NOTICE 'User already has a company';
        END IF;
    ELSE
        RAISE NOTICE 'No authenticated user found';
    END IF;
END $$;