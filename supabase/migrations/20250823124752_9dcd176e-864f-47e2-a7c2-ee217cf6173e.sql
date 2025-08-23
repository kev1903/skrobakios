-- Create security_events table for comprehensive security logging
-- This table will track all security-related events across the application

CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata jsonb DEFAULT '{}'::jsonb,
  severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on security_events table
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);

-- Only superadmins can view security events
CREATE POLICY "superadmins_can_view_security_events" ON public.security_events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
);

-- Only service role can insert security events (for edge functions)
CREATE POLICY "service_role_can_insert_security_events" ON public.security_events
FOR INSERT WITH CHECK (
  auth.role() = 'service_role'
);

-- Add voice-specific rate limiting table
CREATE TABLE IF NOT EXISTS public.voice_chat_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start timestamp with time zone NOT NULL DEFAULT now(),
  session_end timestamp with time zone,
  total_duration_seconds integer DEFAULT 0,
  total_requests integer DEFAULT 0,
  max_requests_per_session integer DEFAULT 100,
  max_duration_minutes integer DEFAULT 30,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on voice_chat_sessions
ALTER TABLE public.voice_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own voice chat sessions
CREATE POLICY "users_own_voice_sessions" ON public.voice_chat_sessions
FOR ALL USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Superadmins can view all voice sessions for monitoring
CREATE POLICY "superadmins_view_all_voice_sessions" ON public.voice_chat_sessions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
);

-- Create function to automatically update voice session timestamps
CREATE OR REPLACE FUNCTION update_voice_sessions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Create trigger for voice sessions
DROP TRIGGER IF EXISTS update_voice_sessions_updated_at_trigger ON public.voice_chat_sessions;
CREATE TRIGGER update_voice_sessions_updated_at_trigger
  BEFORE UPDATE ON public.voice_chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_sessions_updated_at();