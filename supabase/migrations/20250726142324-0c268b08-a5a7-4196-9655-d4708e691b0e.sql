-- Phase 1: Database Security Hardening (Corrected)
-- Fix critical RLS policies and enhance user management security

-- 1. Create proper access tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_access_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  token_type text NOT NULL CHECK (token_type IN ('invitation', 'password_reset', 'email_verification')),
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_by uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on access tokens if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'user_access_tokens' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.user_access_tokens ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop and recreate RLS policy for access tokens
DROP POLICY IF EXISTS "Service role can manage access tokens" ON public.user_access_tokens;
CREATE POLICY "Service role can manage access tokens" 
ON public.user_access_tokens 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 2. Enhance user_roles table with proper constraints and indexes
DO $$
BEGIN
  -- Add constraint if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'user_roles_user_id_check') THEN
    ALTER TABLE public.user_roles 
    ADD CONSTRAINT user_roles_user_id_check 
    CHECK (user_id IS NOT NULL);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- 3. Fix profiles table RLS policies to be more secure
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can delete all profiles" ON public.profiles;

-- Create more restrictive policies
DROP POLICY IF EXISTS "Users can view active profiles" ON public.profiles;
CREATE POLICY "Users can view active profiles" 
ON public.profiles 
FOR SELECT 
USING (status = 'active' AND (public_profile = true OR auth.uid() = user_id));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id AND status = 'active')
WITH CHECK (auth.uid() = user_id);

-- Superadmins can manage all profiles
DROP POLICY IF EXISTS "Superadmins can manage all profiles" ON public.profiles;
CREATE POLICY "Superadmins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
);

-- 4. Create invitation management table
CREATE TABLE IF NOT EXISTS public.user_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  invited_by uuid NOT NULL,
  company_id uuid,
  token text NOT NULL UNIQUE DEFAULT public.generate_invitation_token(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamp with time zone,
  revoked_at timestamp with time zone,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on invitations
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'user_invitations' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- RLS policies for invitations
DROP POLICY IF EXISTS "Superadmins can manage all invitations" ON public.user_invitations;
CREATE POLICY "Superadmins can manage all invitations" 
ON public.user_invitations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
);

DROP POLICY IF EXISTS "Company admins can manage company invitations" ON public.user_invitations;
CREATE POLICY "Company admins can manage company invitations" 
ON public.user_invitations 
FOR ALL 
USING (
  company_id IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.company_members cm 
    WHERE cm.company_id = user_invitations.company_id 
    AND cm.user_id = auth.uid() 
    AND cm.role IN ('owner', 'admin') 
    AND cm.status = 'active'
  )
);

DROP POLICY IF EXISTS "Users can view their own invitations" ON public.user_invitations;
CREATE POLICY "Users can view their own invitations" 
ON public.user_invitations 
FOR SELECT 
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- 5. Add audit logging for user management actions
CREATE TABLE IF NOT EXISTS public.user_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  target_user_id uuid,
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'user_audit_log' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.user_audit_log ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop and recreate audit log policies
DROP POLICY IF EXISTS "Superadmins can view audit logs" ON public.user_audit_log;
CREATE POLICY "Superadmins can view audit logs" 
ON public.user_audit_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
);

DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.user_audit_log;
CREATE POLICY "Service role can insert audit logs" 
ON public.user_audit_log 
FOR INSERT 
WITH CHECK (true);

-- 6. Create/update timestamp triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_user_access_tokens_updated_at ON public.user_access_tokens;
CREATE TRIGGER update_user_access_tokens_updated_at
  BEFORE UPDATE ON public.user_access_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_invitations_updated_at ON public.user_invitations;
CREATE TRIGGER update_user_invitations_updated_at
  BEFORE UPDATE ON public.user_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Enhanced security functions
CREATE OR REPLACE FUNCTION public.is_superadmin(target_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = target_user_id 
    AND role = 'superadmin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.can_manage_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  current_user_level integer;
  target_user_level integer;
BEGIN
  -- Get current user's highest role level
  SELECT public.get_user_highest_role_level(auth.uid()) INTO current_user_level;
  
  -- Get target user's highest role level
  SELECT public.get_user_highest_role_level(target_user_id) INTO target_user_level;
  
  -- Can only manage users with lower level
  RETURN current_user_level > target_user_level;
END;
$$;