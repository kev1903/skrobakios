-- Allow public access to verify user invitations by token
-- This is needed for the invitation acceptance page to work
CREATE POLICY "Anyone can verify invitations by token" 
ON public.user_invitations 
FOR SELECT 
USING (true);