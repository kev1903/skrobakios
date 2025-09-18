-- Populate project_members table with project creators as owners
INSERT INTO public.project_members (project_id, user_id, email, role, status, joined_at)
SELECT 
  p.id as project_id,
  p.created_by as user_id,
  pr.email,
  'owner' as role,
  'active' as status,
  p.created_at as joined_at
FROM public.projects p
JOIN public.profiles pr ON p.created_by = pr.user_id
WHERE p.created_by IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.project_members pm 
  WHERE pm.project_id = p.id AND pm.user_id = p.created_by
);

-- Create function to automatically add project creator as owner
CREATE OR REPLACE FUNCTION public.add_project_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the creator's email from profiles
  INSERT INTO public.project_members (project_id, user_id, email, role, status, joined_at)
  SELECT 
    NEW.id,
    NEW.created_by,
    pr.email,
    'owner',
    'active',
    NEW.created_at
  FROM public.profiles pr
  WHERE pr.user_id = NEW.created_by;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically add project creator as owner
CREATE TRIGGER add_project_creator_trigger
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.add_project_creator_as_owner();

-- Update invitation acceptance to create project_members records
CREATE OR REPLACE FUNCTION public.handle_project_invitation_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  -- When invitation is accepted, create project member record
  IF NEW.accepted_at IS NOT NULL AND OLD.accepted_at IS NULL THEN
    INSERT INTO public.project_members (project_id, user_id, email, role, status, joined_at)
    VALUES (
      NEW.project_id,
      auth.uid(),
      NEW.email,
      NEW.role,
      'active',
      NEW.accepted_at
    )
    ON CONFLICT (project_id, user_id) DO UPDATE SET
      role = EXCLUDED.role,
      status = 'active',
      joined_at = EXCLUDED.joined_at;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for invitation acceptance
CREATE TRIGGER handle_invitation_acceptance_trigger
  AFTER UPDATE ON public.project_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_project_invitation_acceptance();