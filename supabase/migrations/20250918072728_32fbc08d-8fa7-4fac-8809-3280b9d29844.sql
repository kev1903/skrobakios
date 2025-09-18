-- Simple migration to fix tables without referencing non-existent columns

-- Fix feature_flags table
ALTER TABLE public.feature_flags 
ADD COLUMN IF NOT EXISTS flag_key TEXT;

-- Set flag_key for existing records (use flag_name if available, otherwise generate)
UPDATE public.feature_flags 
SET flag_key = COALESCE(flag_key, flag_name, 'key_' || id::text) 
WHERE flag_key IS NULL;

-- Make flag_key NOT NULL
ALTER TABLE public.feature_flags 
ALTER COLUMN flag_key SET NOT NULL;

-- Add unique constraint on flag_key if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'feature_flags_flag_key_unique') THEN
    ALTER TABLE public.feature_flags ADD CONSTRAINT feature_flags_flag_key_unique UNIQUE(flag_key);
  END IF;
END $$;

-- Add conditions column if missing
ALTER TABLE public.feature_flags 
ADD COLUMN IF NOT EXISTS conditions JSONB DEFAULT '{}';

-- Update conditions for existing records
UPDATE public.feature_flags 
SET conditions = '{}' 
WHERE conditions IS NULL;

-- Fix maintenance_windows table
ALTER TABLE public.maintenance_windows 
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS actual_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS actual_end TIMESTAMP WITH TIME ZONE;

-- Add scheduled_start and scheduled_end if they don't exist
ALTER TABLE public.maintenance_windows 
ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMP WITH TIME ZONE;

-- Fix company_overrides table structure (only add missing columns)
ALTER TABLE public.company_overrides 
ADD COLUMN IF NOT EXISTS override_type TEXT DEFAULT 'setting',
ADD COLUMN IF NOT EXISTS reason TEXT,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_user_id_role_unique UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for user_roles
DROP POLICY IF EXISTS "Only superadmins can access user roles" ON public.user_roles;
CREATE POLICY "Only superadmins can access user roles" ON public.user_roles
  FOR ALL USING (public.is_superadmin());

-- Update existing feature flags to have proper flag_name values if they're missing
UPDATE public.feature_flags 
SET flag_name = COALESCE(flag_name, flag_key, 'Feature ' || id::text) 
WHERE flag_name IS NULL OR flag_name = '';