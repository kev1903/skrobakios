
-- Create enum for access levels
CREATE TYPE public.access_level AS ENUM ('private_to_members', 'public', 'restricted');

-- Create enum for member roles with specific permissions
CREATE TYPE public.member_role AS ENUM ('project_admin', 'editor', 'viewer', 'guest');

-- Create table for team members with enhanced permissions
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role member_role NOT NULL DEFAULT 'viewer',
  status TEXT NOT NULL DEFAULT 'pending',
  invited_by UUID,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  notify_on_task_added BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, email)
);

-- Create table for project access settings
CREATE TABLE public.project_access_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE,
  access_level access_level NOT NULL DEFAULT 'private_to_members',
  allow_member_invites BOOLEAN DEFAULT true,
  require_approval_for_join BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for member permissions
CREATE TABLE public.member_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL,
  allowed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_access_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for team_members
CREATE POLICY "Anyone can view team members" 
  ON public.team_members 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create team members" 
  ON public.team_members 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update team members" 
  ON public.team_members 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete team members" 
  ON public.team_members 
  FOR DELETE 
  USING (true);

-- RLS policies for project_access_settings
CREATE POLICY "Anyone can view project access settings" 
  ON public.project_access_settings 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create project access settings" 
  ON public.project_access_settings 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update project access settings" 
  ON public.project_access_settings 
  FOR UPDATE 
  USING (true);

-- RLS policies for member_permissions
CREATE POLICY "Anyone can view member permissions" 
  ON public.member_permissions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create member permissions" 
  ON public.member_permissions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update member permissions" 
  ON public.member_permissions 
  FOR UPDATE 
  USING (true);

-- Insert default access settings for existing projects
INSERT INTO public.project_access_settings (project_id, access_level)
SELECT id, 'private_to_members'::access_level
FROM public.projects
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_access_settings WHERE project_id = projects.id
);
