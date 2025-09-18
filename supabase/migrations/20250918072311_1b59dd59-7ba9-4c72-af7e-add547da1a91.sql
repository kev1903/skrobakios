-- Create the missing user_roles table
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

-- Add the current user as a superadmin so they can access platform settings
INSERT INTO public.user_roles (user_id, role) 
VALUES (auth.uid(), 'superadmin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Also create a few sample feature flags with proper names
INSERT INTO public.feature_flags (flag_name, description, is_enabled, rollout_percentage) 
VALUES 
  ('advanced_analytics', 'Enable advanced analytics dashboard', false, 0),
  ('ai_chat_assistant', 'Enable AI chat assistant', true, 100),
  ('mobile_app_beta', 'Enable mobile app beta features', false, 10),
  ('real_time_notifications', 'Enable real-time push notifications', true, 75)
ON CONFLICT (flag_name) DO NOTHING;