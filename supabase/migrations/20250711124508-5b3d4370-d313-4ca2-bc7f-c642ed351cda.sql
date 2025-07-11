-- First, let's check if the user_role enum exists and create it if it doesn't
DO $$ 
BEGIN
    -- Check if the enum type exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        -- Create the user_role enum type
        CREATE TYPE user_role AS ENUM (
            'superadmin',
            'admin', 
            'user',
            'project_manager',
            'project_admin',
            'consultant',
            'subcontractor',
            'estimator',
            'accounts',
            'client_viewer'
        );
    END IF;
END $$;

-- Update the user_roles table to use the enum if it's not already using it
DO $$
BEGIN
    -- Check if the role column exists and has the wrong type
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_roles' 
        AND column_name = 'role' 
        AND data_type != 'USER-DEFINED'
    ) THEN
        -- First update any invalid role values to 'user'
        UPDATE public.user_roles 
        SET role = 'user' 
        WHERE role NOT IN ('superadmin', 'admin', 'user', 'project_manager', 'project_admin', 'consultant', 'subcontractor', 'estimator', 'accounts', 'client_viewer');
        
        -- Now alter the column to use the enum type
        ALTER TABLE public.user_roles 
        ALTER COLUMN role TYPE user_role USING role::user_role;
    END IF;
END $$;