-- Simple migration to fix the platform settings issue
-- Update existing feature flags to have proper flag_name values
UPDATE public.feature_flags SET flag_name = 'advanced_analytics' WHERE flag_name IS NULL AND description LIKE '%advanced analytics%';
UPDATE public.feature_flags SET flag_name = 'ai_chat_assistant' WHERE flag_name IS NULL AND description LIKE '%AI chat%';
UPDATE public.feature_flags SET flag_name = 'mobile_app_beta' WHERE flag_name IS NULL AND description LIKE '%mobile app%';
UPDATE public.feature_flags SET flag_name = 'real_time_notifications' WHERE flag_name IS NULL AND description LIKE '%real-time%';

-- Set default flag_name for any remaining NULL values
UPDATE public.feature_flags SET flag_name = 'unnamed_feature_' || id::text WHERE flag_name IS NULL;

-- Ensure platform_settings has some default data
INSERT INTO public.platform_settings (setting_key, setting_value, setting_type, description) VALUES
('maintenance_mode', 'false', 'system', 'Enable/disable maintenance mode'),
('max_file_upload_size', '10485760', 'system', 'Maximum file upload size in bytes'),
('session_timeout', '3600', 'security', 'Session timeout in seconds'),
('password_min_length', '8', 'security', 'Minimum password length'),
('enable_email_notifications', 'true', 'notifications', 'Enable email notifications'),
('default_theme', '"light"', 'ui', 'Default application theme')
ON CONFLICT (setting_key) DO NOTHING;

-- Create company_overrides table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.company_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  override_key TEXT NOT NULL,
  override_value JSONB NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, override_key)
);

-- Create platform_audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.platform_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS and create policies
ALTER TABLE public.company_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for the new tables
DROP POLICY IF EXISTS "Only superadmins can access company overrides" ON public.company_overrides;
CREATE POLICY "Only superadmins can access company overrides" ON public.company_overrides
  FOR ALL USING (public.is_superadmin());

DROP POLICY IF EXISTS "Only superadmins can access platform audit logs" ON public.platform_audit_logs;
CREATE POLICY "Only superadmins can access platform audit logs" ON public.platform_audit_logs
  FOR ALL USING (public.is_superadmin());