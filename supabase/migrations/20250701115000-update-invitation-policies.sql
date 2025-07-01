
-- Allow updates to team invitations so they can be marked as used
CREATE POLICY "Anyone can update team invitations" 
  ON public.team_invitations 
  FOR UPDATE 
  USING (true);
