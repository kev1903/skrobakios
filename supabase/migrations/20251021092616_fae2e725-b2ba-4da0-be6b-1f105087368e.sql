-- Security Fix: Create server-side session management for impersonation

-- Create impersonation_sessions table for server-side validation
CREATE TABLE public.impersonation_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_validated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT valid_expiration CHECK (expires_at > created_at)
);

-- Enable RLS on impersonation_sessions
ALTER TABLE public.impersonation_sessions ENABLE ROW LEVEL SECURITY;

-- Only superadmins can view impersonation sessions
CREATE POLICY "Superadmins can view impersonation sessions"
ON public.impersonation_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'superadmin'
  )
);

-- Only superadmins can create impersonation sessions
CREATE POLICY "Superadmins can create impersonation sessions"
ON public.impersonation_sessions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'superadmin'
  )
);

-- Only superadmins can update impersonation sessions
CREATE POLICY "Superadmins can update impersonation sessions"
ON public.impersonation_sessions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'superadmin'
  )
);

-- Create index for fast token lookups
CREATE INDEX idx_impersonation_sessions_token ON public.impersonation_sessions(token);
CREATE INDEX idx_impersonation_sessions_active ON public.impersonation_sessions(is_active, expires_at);

-- Function to validate impersonation session
CREATE OR REPLACE FUNCTION public.validate_impersonation_session(session_token TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  admin_user_id UUID,
  target_user_id UUID,
  session_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_record RECORD;
BEGIN
  -- Find active session with valid token and expiration
  SELECT 
    id,
    impersonation_sessions.admin_user_id,
    impersonation_sessions.target_user_id,
    expires_at,
    is_active
  INTO session_record
  FROM public.impersonation_sessions
  WHERE token = session_token
  AND is_active = true
  AND expires_at > now()
  LIMIT 1;

  -- Check if session was found
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::UUID, NULL::UUID;
    RETURN;
  END IF;

  -- Update last validated timestamp
  UPDATE public.impersonation_sessions
  SET last_validated_at = now()
  WHERE id = session_record.id;

  -- Return valid session info
  RETURN QUERY SELECT 
    true,
    session_record.admin_user_id,
    session_record.target_user_id,
    session_record.id;
END;
$$;

-- Function to end impersonation session
CREATE OR REPLACE FUNCTION public.end_impersonation_session(session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mark session as inactive
  UPDATE public.impersonation_sessions
  SET is_active = false
  WHERE id = session_id
  AND admin_user_id = auth.uid();

  RETURN FOUND;
END;
$$;

-- Cleanup expired sessions (can be run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_impersonation_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.impersonation_sessions
  WHERE expires_at < now() - INTERVAL '7 days'
  OR (is_active = false AND created_at < now() - INTERVAL '7 days');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;