-- Create feature_flags table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_users TEXT[],
  target_companies TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

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

-- Enable RLS on new tables
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - only superadmins can access platform administration tables
CREATE POLICY "Only superadmins can access feature flags" ON public.feature_flags
  FOR ALL USING (public.is_superadmin());

CREATE POLICY "Only superadmins can access company overrides" ON public.company_overrides
  FOR ALL USING (public.is_superadmin());

CREATE POLICY "Only superadmins can access platform audit logs" ON public.platform_audit_logs
  FOR ALL USING (public.is_superadmin());

-- Insert some default sample feature flags
INSERT INTO public.feature_flags (name, description, is_enabled, rollout_percentage) VALUES
('advanced_analytics', 'Enable advanced analytics dashboard', false, 0),
('ai_chat_assistant', 'Enable AI chat assistant', true, 100),
('mobile_app_beta', 'Enable mobile app beta features', false, 10),
('real_time_notifications', 'Enable real-time push notifications', true, 75)
ON CONFLICT (name) DO NOTHING;

-- Create update triggers for new tables
CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_overrides_updated_at
  BEFORE UPDATE ON public.company_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();