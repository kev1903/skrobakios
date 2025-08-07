-- Insert default platform settings if they don't exist
INSERT INTO public.platform_settings (setting_key, setting_value, setting_type, description) 
SELECT * FROM (VALUES
  ('site_name', '"Lovable Platform"', 'general', 'Name of the platform'),
  ('maintenance_mode', 'false', 'system', 'Enable maintenance mode'),
  ('registration_enabled', 'true', 'auth', 'Allow new user registrations'),
  ('max_companies_per_user', '5', 'limits', 'Maximum companies a user can create'),
  ('max_projects_per_company', '100', 'limits', 'Maximum projects per company'),
  ('default_subscription_plan', '"FREE"', 'subscription', 'Default subscription plan for new users'),
  ('email_notifications_enabled', 'true', 'notifications', 'Enable email notifications'),
  ('api_rate_limit', '{"requests_per_minute": 60, "burst_limit": 100}', 'api', 'API rate limiting configuration'),
  ('file_upload_limits', '{"max_file_size_mb": 50, "allowed_types": ["pdf", "doc", "docx", "jpg", "png"]}', 'files', 'File upload restrictions'),
  ('security_settings', '{"password_min_length": 8, "require_2fa": false, "session_timeout_hours": 24}', 'security', 'Security configuration')
) AS v(setting_key, setting_value, setting_type, description)
WHERE NOT EXISTS (SELECT 1 FROM public.platform_settings WHERE platform_settings.setting_key = v.setting_key);

-- Insert default feature flags if they don't exist
INSERT INTO public.feature_flags (flag_name, flag_key, description, is_enabled) 
SELECT * FROM (VALUES
  ('Advanced Analytics', 'advanced_analytics', 'Enable advanced analytics features', false),
  ('AI Assistant', 'ai_assistant', 'Enable AI assistant functionality', true),
  ('Real-time Collaboration', 'realtime_collaboration', 'Enable real-time collaboration features', true),
  ('Advanced Reporting', 'advanced_reporting', 'Enable advanced reporting capabilities', false),
  ('Mobile App Access', 'mobile_app_access', 'Allow access to mobile applications', true),
  ('Beta Features', 'beta_features', 'Enable access to beta features', false)
) AS v(flag_name, flag_key, description, is_enabled)
WHERE NOT EXISTS (SELECT 1 FROM public.feature_flags WHERE feature_flags.flag_key = v.flag_key);

-- Create function to log platform actions if it doesn't exist
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
SET search_path = 'public'
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