-- Create user_roles table for app-level roles (if not exists)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Superadmins can manage all user roles" ON public.user_roles;
CREATE POLICY "Superadmins can manage all user roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'superadmin'
  )
);

-- Create feature_flags table (if not exists)
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flag_name text NOT NULL UNIQUE,
  flag_description text,
  is_enabled boolean NOT NULL DEFAULT false,
  flag_type text NOT NULL DEFAULT 'boolean',
  flag_value jsonb DEFAULT 'false'::jsonb,
  environment text NOT NULL DEFAULT 'production',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  last_modified_by uuid
);

-- Enable RLS for feature_flags
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Superadmins can manage feature flags" ON public.feature_flags;
CREATE POLICY "Superadmins can manage feature flags"
ON public.feature_flags
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'superadmin'
  )
);

-- Insert default superadmin role for the current user
INSERT INTO public.user_roles (user_id, role)
SELECT '5213f4be-54a3-4985-a88e-e460154e52fd'::uuid, 'superadmin'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd'::uuid 
  AND role = 'superadmin'::app_role
);

-- Insert some default feature flags
INSERT INTO public.feature_flags (flag_name, flag_description, is_enabled, flag_type) VALUES
('maintenance_mode', 'Enable/disable maintenance mode', false, 'boolean'),
('new_user_registration', 'Allow new user registrations', true, 'boolean'),
('enhanced_logging', 'Enable enhanced application logging', false, 'boolean'),
('beta_features', 'Enable beta features for testing', false, 'boolean')
ON CONFLICT (flag_name) DO NOTHING;