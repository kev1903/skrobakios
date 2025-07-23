-- Add policy to allow service role operations on user_access_tokens
CREATE POLICY "Service role can manage access tokens" 
ON public.user_access_tokens 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Also add a unique constraint that the application expects
ALTER TABLE public.user_access_tokens 
ADD CONSTRAINT user_access_tokens_user_token_type_unique 
UNIQUE (user_id, token_type);