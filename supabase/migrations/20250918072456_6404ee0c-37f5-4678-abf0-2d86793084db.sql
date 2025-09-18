-- Fix feature_flags table structure to match the interface
ALTER TABLE public.feature_flags 
ADD COLUMN IF NOT EXISTS flag_key TEXT,
ADD COLUMN IF NOT EXISTS conditions JSONB DEFAULT '{}';

-- Update existing feature flags to have flag_key values
UPDATE public.feature_flags 
SET flag_key = COALESCE(flag_key, flag_name, 'key_' || id::text) 
WHERE flag_key IS NULL;

-- Make flag_key NOT NULL after setting values
ALTER TABLE public.feature_flags 
ALTER COLUMN flag_key SET NOT NULL;

-- Add unique constraint on flag_key
ALTER TABLE public.feature_flags 
ADD CONSTRAINT feature_flags_flag_key_unique UNIQUE(flag_key);

-- Fix maintenance_windows table structure to match the interface
ALTER TABLE public.maintenance_windows 
ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS actual_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS actual_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT false;

-- Copy data from old columns to new ones if they exist
UPDATE public.maintenance_windows 
SET 
  scheduled_start = COALESCE(scheduled_start, start_time),
  scheduled_end = COALESCE(scheduled_end, end_time)
WHERE scheduled_start IS NULL OR scheduled_end IS NULL;

-- Fix company_overrides table structure to match the interface  
ALTER TABLE public.company_overrides 
ADD COLUMN IF NOT EXISTS override_type TEXT DEFAULT 'setting',
ADD COLUMN IF NOT EXISTS reason TEXT,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing data
UPDATE public.company_overrides 
SET reason = description 
WHERE reason IS NULL AND description IS NOT NULL;

-- Create user_roles table with correct structure
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

-- Insert some sample feature flags with all required columns
INSERT INTO public.feature_flags (flag_name, flag_key, description, is_enabled, rollout_percentage, conditions) 
SELECT 'Advanced Analytics', 'advanced_analytics', 'Enable advanced analytics dashboard', false, 0, '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.feature_flags WHERE flag_key = 'advanced_analytics');

INSERT INTO public.feature_flags (flag_name, flag_key, description, is_enabled, rollout_percentage, conditions) 
SELECT 'AI Chat Assistant', 'ai_chat_assistant', 'Enable AI chat assistant', true, 100, '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.feature_flags WHERE flag_key = 'ai_chat_assistant');