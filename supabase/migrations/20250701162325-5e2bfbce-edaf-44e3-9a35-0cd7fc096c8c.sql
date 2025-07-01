
-- Create a table for user invitations
CREATE TABLE public.user_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  invited_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_role user_role NOT NULL DEFAULT 'user',
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_invitations
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for user_invitations
CREATE POLICY "Superadmin can view all invitations" 
  ON public.user_invitations 
  FOR SELECT 
  USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmin can create invitations" 
  ON public.user_invitations 
  FOR INSERT 
  WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmin can update invitations" 
  ON public.user_invitations 
  FOR UPDATE 
  USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmin can delete invitations" 
  ON public.user_invitations 
  FOR DELETE 
  USING (public.is_superadmin(auth.uid()));

-- Add index for faster token lookups
CREATE INDEX idx_user_invitations_token ON public.user_invitations(token);
CREATE INDEX idx_user_invitations_email ON public.user_invitations(email);
