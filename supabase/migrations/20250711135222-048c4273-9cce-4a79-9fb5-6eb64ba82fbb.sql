-- Insert a superadmin role for the current authenticated user (if any exists)
-- This is a one-time setup to create the first superadmin
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get the first user from auth.users (if any)
    SELECT id INTO first_user_id 
    FROM auth.users 
    ORDER BY created_at 
    LIMIT 1;
    
    -- If a user exists, make them a superadmin
    IF first_user_id IS NOT NULL THEN
        -- Remove any existing roles for this user
        DELETE FROM public.user_roles WHERE user_id = first_user_id;
        
        -- Insert superadmin role
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (first_user_id, 'superadmin');
        
        RAISE NOTICE 'First user (%) has been assigned superadmin role', first_user_id;
    ELSE
        RAISE NOTICE 'No users found in auth.users table';
    END IF;
END $$;