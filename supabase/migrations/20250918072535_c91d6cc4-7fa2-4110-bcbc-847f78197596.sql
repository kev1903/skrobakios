-- Fix feature_flags table structure to match the interface (simplified)
ALTER TABLE public.feature_flags 
ADD COLUMN IF NOT EXISTS flag_key TEXT;

-- Set flag_key for existing records
UPDATE public.feature_flags 
SET flag_key = COALESCE(flag_key, flag_name, 'key_' || id::text) 
WHERE flag_key IS NULL;

-- Make flag_key NOT NULL and unique
ALTER TABLE public.feature_flags 
ALTER COLUMN flag_key SET NOT NULL;

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

-- Fix maintenance_windows table - add missing columns only
ALTER TABLE public.maintenance_windows 
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT false;

-- For maintenance windows, rename existing columns to match interface
DO $$
BEGIN
  -- Check if old columns exist and rename them
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_windows' AND column_name = 'start_time') THEN
    ALTER TABLE public.maintenance_windows RENAME COLUMN start_time TO scheduled_start;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_windows' AND column_name = 'end_time') THEN
    ALTER TABLE public.maintenance_windows RENAME COLUMN end_time TO scheduled_end;
  END IF;
END $$;

-- Add missing maintenance window columns
ALTER TABLE public.maintenance_windows 
ADD COLUMN IF NOT EXISTS actual_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS actual_end TIMESTAMP WITH TIME ZONE;

-- Fix company_overrides table structure  
ALTER TABLE public.company_overrides 
ADD COLUMN IF NOT EXISTS override_type TEXT DEFAULT 'setting',
ADD COLUMN IF NOT EXISTS reason TEXT,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing company overrides data
UPDATE public.company_overrides 
SET reason = description 
WHERE reason IS NULL AND description IS NOT NULL;

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