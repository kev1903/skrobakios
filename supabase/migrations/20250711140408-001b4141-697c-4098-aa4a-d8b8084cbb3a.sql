-- Add existing users to roles table
DO $$
DECLARE
    first_user_id UUID;
    first_profile profiles%ROWTYPE;
BEGIN
    -- Get the first user profile (presumably the initial admin)
    SELECT * INTO first_profile FROM profiles 
    WHERE status = 'active' 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- If a profile exists, assign superadmin role
    IF found THEN
        -- First clear any existing roles for this user
        DELETE FROM user_roles WHERE user_id = first_profile.user_id;
        
        -- Insert superadmin role
        INSERT INTO user_roles (user_id, role) 
        VALUES (first_profile.user_id, 'superadmin');
        
        RAISE NOTICE 'User % % assigned superadmin role', first_profile.first_name, first_profile.last_name;
    ELSE
        RAISE NOTICE 'No active users found in profiles table';
    END IF;
END $$;