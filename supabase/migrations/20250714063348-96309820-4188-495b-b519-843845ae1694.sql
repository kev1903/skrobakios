-- Create project_members table for project-specific team roles
CREATE TABLE public.project_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT, -- For pending invitations
  role TEXT NOT NULL DEFAULT 'member', -- project_admin, editor, viewer, guest
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, inactive
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id),
  UNIQUE(project_id, email)
);

-- Create invitations table for managing team invites
CREATE TABLE public.project_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, declined, expired
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on project_members
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Enable RLS on project_invitations
ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_members
CREATE POLICY "Project members can view team members" 
ON public.project_members 
FOR SELECT 
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p 
    JOIN company_members cm ON p.company_id = cm.company_id 
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Project admins can manage team members" 
ON public.project_members 
FOR ALL 
USING (
  project_id IN (
    SELECT pm.project_id 
    FROM project_members pm 
    WHERE pm.user_id = auth.uid() 
    AND pm.role IN ('project_admin') 
    AND pm.status = 'active'
  )
  OR
  project_id IN (
    SELECT p.id 
    FROM projects p 
    JOIN company_members cm ON p.company_id = cm.company_id 
    WHERE cm.user_id = auth.uid() 
    AND cm.role IN ('owner', 'admin') 
    AND cm.status = 'active'
  )
);

-- RLS policies for project_invitations
CREATE POLICY "Project admins can manage invitations" 
ON public.project_invitations 
FOR ALL 
USING (
  project_id IN (
    SELECT pm.project_id 
    FROM project_members pm 
    WHERE pm.user_id = auth.uid() 
    AND pm.role IN ('project_admin') 
    AND pm.status = 'active'
  )
  OR
  project_id IN (
    SELECT p.id 
    FROM projects p 
    JOIN company_members cm ON p.company_id = cm.company_id 
    WHERE cm.user_id = auth.uid() 
    AND cm.role IN ('owner', 'admin') 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Invited users can view their invitations" 
ON public.project_invitations 
FOR SELECT 
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Create updated_at triggers
CREATE TRIGGER update_project_members_updated_at
BEFORE UPDATE ON public.project_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_invitations_updated_at
BEFORE UPDATE ON public.project_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate invitation tokens
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$;

-- Function to accept project invitation
CREATE OR REPLACE FUNCTION public.accept_project_invitation(invitation_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record RECORD;
  user_email TEXT;
  result JSON;
BEGIN
  -- Get user email
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  IF user_email IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not authenticated');
  END IF;

  -- Find valid invitation
  SELECT * INTO invitation_record 
  FROM public.project_invitations 
  WHERE token = invitation_token 
  AND email = user_email
  AND status = 'pending' 
  AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;

  -- Update invitation as accepted
  UPDATE public.project_invitations 
  SET status = 'accepted', accepted_at = now(), updated_at = now()
  WHERE id = invitation_record.id;

  -- Add user to project_members
  INSERT INTO public.project_members (
    project_id, user_id, email, role, status, invited_by, invited_at, joined_at
  ) VALUES (
    invitation_record.project_id, 
    auth.uid(), 
    user_email, 
    invitation_record.role, 
    'active', 
    invitation_record.invited_by, 
    invitation_record.created_at, 
    now()
  )
  ON CONFLICT (project_id, user_id) DO UPDATE SET
    status = 'active',
    role = invitation_record.role,
    joined_at = now(),
    updated_at = now();

  RETURN json_build_object(
    'success', true, 
    'project_id', invitation_record.project_id,
    'role', invitation_record.role
  );
END;
$$;