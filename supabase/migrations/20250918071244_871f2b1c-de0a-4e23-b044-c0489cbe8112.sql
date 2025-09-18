-- Check and add missing columns to existing tables

-- Add missing columns to feature_flags if they don't exist
DO $$ 
BEGIN
  -- Add name column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'feature_flags' AND column_name = 'name') THEN
    ALTER TABLE public.feature_flags ADD COLUMN name TEXT NOT NULL DEFAULT 'unnamed_feature';
  END IF;
  
  -- Add description column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'feature_flags' AND column_name = 'description') THEN
    ALTER TABLE public.feature_flags ADD COLUMN description TEXT;
  END IF;
  
  -- Add is_enabled column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'feature_flags' AND column_name = 'is_enabled') THEN
    ALTER TABLE public.feature_flags ADD COLUMN is_enabled BOOLEAN DEFAULT false;
  END IF;
  
  -- Add rollout_percentage column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'feature_flags' AND column_name = 'rollout_percentage') THEN
    ALTER TABLE public.feature_flags ADD COLUMN rollout_percentage INTEGER DEFAULT 0;
  END IF;
  
  -- Add target_users column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'feature_flags' AND column_name = 'target_users') THEN
    ALTER TABLE public.feature_flags ADD COLUMN target_users TEXT[];
  END IF;
  
  -- Add target_companies column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'feature_flags' AND column_name = 'target_companies') THEN
    ALTER TABLE public.feature_flags ADD COLUMN target_companies TEXT[];
  END IF;
END
$$;

-- Create company_overrides table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.company_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  override_key TEXT NOT NULL,
  override_value JSONB NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'company_overrides_company_id_override_key_key') THEN
    ALTER TABLE public.company_overrides ADD CONSTRAINT company_overrides_company_id_override_key_key UNIQUE(company_id, override_key);
  END IF;
END
$$;

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

-- Enable RLS on all tables
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create or replace RLS policies
DROP POLICY IF EXISTS "Only superadmins can access feature flags" ON public.feature_flags;
CREATE POLICY "Only superadmins can access feature flags" ON public.feature_flags
  FOR ALL USING (public.is_superadmin());

DROP POLICY IF EXISTS "Only superadmins can access company overrides" ON public.company_overrides;
CREATE POLICY "Only superadmins can access company overrides" ON public.company_overrides
  FOR ALL USING (public.is_superadmin());

DROP POLICY IF EXISTS "Only superadmins can access platform audit logs" ON public.platform_audit_logs;
CREATE POLICY "Only superadmins can access platform audit logs" ON public.platform_audit_logs
  FOR ALL USING (public.is_superadmin());

-- Add some default platform settings if they don't exist
INSERT INTO public.platform_settings (setting_key, setting_value, setting_type, description) VALUES
('maintenance_mode', 'false', 'system', 'Enable/disable maintenance mode'),
('max_file_upload_size', '10485760', 'system', 'Maximum file upload size in bytes'),
('session_timeout', '3600', 'security', 'Session timeout in seconds'),
('password_min_length', '8', 'security', 'Minimum password length'),
('enable_email_notifications', 'true', 'notifications', 'Enable email notifications'),
('default_theme', '"light"', 'ui', 'Default application theme')
ON CONFLICT (setting_key) DO NOTHING;

-- Add some sample feature flags if the table is empty
INSERT INTO public.feature_flags (name, description, is_enabled, rollout_percentage) 
SELECT 'advanced_analytics', 'Enable advanced analytics dashboard', false, 0
WHERE NOT EXISTS (SELECT 1 FROM public.feature_flags WHERE name = 'advanced_analytics');

INSERT INTO public.feature_flags (name, description, is_enabled, rollout_percentage) 
SELECT 'ai_chat_assistant', 'Enable AI chat assistant', true, 100
WHERE NOT EXISTS (SELECT 1 FROM public.feature_flags WHERE name = 'ai_chat_assistant');

INSERT INTO public.feature_flags (name, description, is_enabled, rollout_percentage) 
SELECT 'mobile_app_beta', 'Enable mobile app beta features', false, 10
WHERE NOT EXISTS (SELECT 1 FROM public.feature_flags WHERE name = 'mobile_app_beta');

INSERT INTO public.feature_flags (name, description, is_enabled, rollout_percentage) 
SELECT 'real_time_notifications', 'Enable real-time push notifications', true, 75
WHERE NOT EXISTS (SELECT 1 FROM public.feature_flags WHERE name = 'real_time_notifications');