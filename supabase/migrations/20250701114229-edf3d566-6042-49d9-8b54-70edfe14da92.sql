
-- Create a table to store invitation tokens
CREATE TABLE public.team_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  invited_by_email TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the invitations table
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Create simple policies that allow anyone to view and create invitations for now
-- (These can be made more restrictive later when authentication is implemented)
CREATE POLICY "Anyone can view team invitations" 
  ON public.team_invitations 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create team invitations" 
  ON public.team_invitations 
  FOR INSERT 
  WITH CHECK (true);

-- Add index for faster token lookups
CREATE INDEX idx_team_invitations_token ON public.team_invitations(token);
CREATE INDEX idx_team_invitations_email ON public.team_invitations(email);
