-- Add new fields to profiles table for enhanced user access tracking
ALTER TABLE public.profiles 
ADD COLUMN password_change_required BOOLEAN DEFAULT true,
ADD COLUMN first_login_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN account_activated BOOLEAN DEFAULT false;

-- Create user_access_tokens table for temporary access links
CREATE TABLE public.user_access_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    token_type TEXT NOT NULL CHECK (token_type IN ('activation', 'password_reset', 'temporary_access')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_access_tokens
ALTER TABLE public.user_access_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_access_tokens
CREATE POLICY "Users can view their own access tokens" 
ON public.user_access_tokens 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can create access tokens" 
ON public.user_access_tokens 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "System can update access tokens" 
ON public.user_access_tokens 
FOR UPDATE 
USING (true);

-- Create function to generate secure tokens
CREATE OR REPLACE FUNCTION public.generate_access_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate and use access token
CREATE OR REPLACE FUNCTION public.use_access_token(token_value TEXT)
RETURNS JSON AS $$
DECLARE
    token_record RECORD;
    result JSON;
BEGIN
    -- Find and validate token
    SELECT * INTO token_record 
    FROM public.user_access_tokens 
    WHERE token = token_value 
    AND used_at IS NULL 
    AND expires_at > now();
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invalid or expired token'
        );
    END IF;
    
    -- Mark token as used
    UPDATE public.user_access_tokens 
    SET used_at = now(), updated_at = now()
    WHERE id = token_record.id;
    
    -- Return success with user info
    RETURN json_build_object(
        'success', true,
        'user_id', token_record.user_id,
        'token_type', token_record.token_type
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to track first login
CREATE OR REPLACE FUNCTION public.track_first_login(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles 
    SET first_login_at = now(),
        account_activated = true,
        updated_at = now()
    WHERE user_id = target_user_id 
    AND first_login_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update trigger for user_access_tokens updated_at
CREATE TRIGGER update_user_access_tokens_updated_at
    BEFORE UPDATE ON public.user_access_tokens
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();