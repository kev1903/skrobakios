-- Create user_roles table for app-level roles
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

-- RLS Policies for user_roles
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

-- Create feature_flags table
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

-- RLS Policies for feature_flags
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

-- Insert some default feature flags
INSERT INTO public.feature_flags (flag_name, flag_description, is_enabled, flag_type) VALUES
('maintenance_mode', 'Enable/disable maintenance mode', false, 'boolean'),
('new_user_registration', 'Allow new user registrations', true, 'boolean'),
('enhanced_logging', 'Enable enhanced application logging', false, 'boolean'),
('beta_features', 'Enable beta features for testing', false, 'boolean')
ON CONFLICT (flag_name) DO NOTHING;

-- Create platform_audit_logs table
CREATE TABLE IF NOT EXISTS public.platform_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  old_values jsonb,
  new_values jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for platform_audit_logs
ALTER TABLE public.platform_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform_audit_logs
CREATE POLICY "Superadmins can view audit logs"
ON public.platform_audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'superadmin'
  )
);

CREATE POLICY "System can insert audit logs"
ON public.platform_audit_logs
FOR INSERT
WITH CHECK (true);

-- Insert default superadmin role for the current user
INSERT INTO public.user_roles (user_id, role)
SELECT '5213f4be-54a3-4985-a88e-e460154e52fd'::uuid, 'superadmin'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd'::uuid 
  AND role = 'superadmin'::app_role
);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags  
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_platform_settings_updated_at();