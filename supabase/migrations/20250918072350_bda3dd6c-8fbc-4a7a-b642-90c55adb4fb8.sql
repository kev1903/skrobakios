-- Create the missing user_roles table (without user insertion)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for user_roles
DROP POLICY IF EXISTS "Only superadmins can access user roles" ON public.user_roles;
CREATE POLICY "Only superadmins can access user roles" ON public.user_roles
  FOR ALL USING (public.is_superadmin());

-- Update feature flags to have proper flag_name values for any that are still missing
UPDATE public.feature_flags 
SET flag_name = COALESCE(flag_name, 'feature_' || id::text) 
WHERE flag_name IS NULL OR flag_name = '';

-- Add a couple more sample feature flags if they don't exist
INSERT INTO public.feature_flags (flag_name, description, is_enabled, rollout_percentage) 
SELECT 'advanced_analytics', 'Enable advanced analytics dashboard', false, 0
WHERE NOT EXISTS (SELECT 1 FROM public.feature_flags WHERE flag_name = 'advanced_analytics');

INSERT INTO public.feature_flags (flag_name, description, is_enabled, rollout_percentage) 
SELECT 'ai_chat_assistant', 'Enable AI chat assistant', true, 100
WHERE NOT EXISTS (SELECT 1 FROM public.feature_flags WHERE flag_name = 'ai_chat_assistant');