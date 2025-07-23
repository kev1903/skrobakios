-- Add policy to allow service role operations on profiles table
CREATE POLICY "Service role can manage profiles" 
ON public.profiles 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);