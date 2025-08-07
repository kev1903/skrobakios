-- Create platform settings table for global system configuration
CREATE TABLE public.platform_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  setting_type TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  is_sensitive BOOLEAN NOT NULL DEFAULT false,
  requires_restart BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  last_modified_by UUID REFERENCES auth.users(id)
);

-- Create system configurations table for technical settings
CREATE TABLE public.system_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_category TEXT NOT NULL,
  config_name TEXT NOT NULL,
  config_value JSONB NOT NULL DEFAULT '{}',
  default_value JSONB,
  validation_rules JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  environment TEXT NOT NULL DEFAULT 'production',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  last_modified_by UUID REFERENCES auth.users(id),
  UNIQUE(config_category, config_name, environment)
);

-- Create platform audit logs for system-level actions
CREATE TABLE public.platform_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  user_id UUID REFERENCES auth.users(id),
  action_details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  severity_level TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create company management overrides for super-admin control
CREATE TABLE public.company_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  override_type TEXT NOT NULL,
  override_key TEXT NOT NULL,
  override_value JSONB NOT NULL DEFAULT '{}',
  reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  last_modified_by UUID REFERENCES auth.users(id),
  UNIQUE(company_id, override_type, override_key)
);

-- Create feature flags table for controlling platform features
CREATE TABLE public.feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flag_name TEXT NOT NULL UNIQUE,
  flag_key TEXT NOT NULL UNIQUE,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_users JSONB DEFAULT '[]',
  target_companies JSONB DEFAULT '[]',
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  last_modified_by UUID REFERENCES auth.users(id)
);

-- Create maintenance windows table
CREATE TABLE public.maintenance_windows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_start TIMESTAMP WITH TIME ZONE,
  actual_end TIMESTAMP WITH TIME ZONE,
  maintenance_type TEXT NOT NULL DEFAULT 'planned',
  affected_services JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'scheduled',
  notification_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on all new tables
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_windows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - Only superadmins can access these tables
CREATE POLICY "Superadmins can manage platform settings"
ON public.platform_settings
FOR ALL
TO authenticated
USING (public.is_superadmin(auth.uid()))
WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can manage system configurations"
ON public.system_configurations
FOR ALL
TO authenticated
USING (public.is_superadmin(auth.uid()))
WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can view platform audit logs"
ON public.platform_audit_logs
FOR SELECT
TO authenticated
USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can manage company overrides"
ON public.company_overrides
FOR ALL
TO authenticated
USING (public.is_superadmin(auth.uid()))
WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can manage feature flags"
ON public.feature_flags
FOR ALL
TO authenticated
USING (public.is_superadmin(auth.uid()))
WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can manage maintenance windows"
ON public.maintenance_windows
FOR ALL
TO authenticated
USING (public.is_superadmin(auth.uid()))
WITH CHECK (public.is_superadmin(auth.uid()));

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_platform_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_platform_settings_updated_at();

CREATE TRIGGER update_system_configurations_updated_at
BEFORE UPDATE ON public.system_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_system_configurations_updated_at();

CREATE TRIGGER update_company_overrides_updated_at
BEFORE UPDATE ON public.company_overrides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at
BEFORE UPDATE ON public.feature_flags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maintenance_windows_updated_at
BEFORE UPDATE ON public.maintenance_windows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default platform settings
INSERT INTO public.platform_settings (setting_key, setting_value, setting_type, description) VALUES
('site_name', '"Lovable Platform"', 'general', 'Name of the platform'),
('maintenance_mode', 'false', 'system', 'Enable maintenance mode'),
('registration_enabled', 'true', 'auth', 'Allow new user registrations'),
('max_companies_per_user', '5', 'limits', 'Maximum companies a user can create'),
('max_projects_per_company', '100', 'limits', 'Maximum projects per company'),
('default_subscription_plan', '"FREE"', 'subscription', 'Default subscription plan for new users'),
('email_notifications_enabled', 'true', 'notifications', 'Enable email notifications'),
('api_rate_limit', '{"requests_per_minute": 60, "burst_limit": 100}', 'api', 'API rate limiting configuration'),
('file_upload_limits', '{"max_file_size_mb": 50, "allowed_types": ["pdf", "doc", "docx", "jpg", "png"]}', 'files', 'File upload restrictions'),
('security_settings', '{"password_min_length": 8, "require_2fa": false, "session_timeout_hours": 24}', 'security', 'Security configuration');

-- Insert default feature flags
INSERT INTO public.feature_flags (flag_name, flag_key, description, is_enabled) VALUES
('Advanced Analytics', 'advanced_analytics', 'Enable advanced analytics features', false),
('AI Assistant', 'ai_assistant', 'Enable AI assistant functionality', true),
('Real-time Collaboration', 'realtime_collaboration', 'Enable real-time collaboration features', true),
('Advanced Reporting', 'advanced_reporting', 'Enable advanced reporting capabilities', false),
('Mobile App Access', 'mobile_app_access', 'Allow access to mobile applications', true),
('Beta Features', 'beta_features', 'Enable access to beta features', false);

-- Create function to log platform actions
CREATE OR REPLACE FUNCTION public.log_platform_action(
  _action_type TEXT,
  _resource_type TEXT,
  _resource_id UUID DEFAULT NULL,
  _action_details JSONB DEFAULT '{}',
  _severity_level TEXT DEFAULT 'info'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.platform_audit_logs (
    action_type,
    resource_type,
    resource_id,
    user_id,
    action_details,
    severity_level
  ) VALUES (
    _action_type,
    _resource_type,
    _resource_id,
    auth.uid(),
    _action_details,
    _severity_level
  );
END;
$$;