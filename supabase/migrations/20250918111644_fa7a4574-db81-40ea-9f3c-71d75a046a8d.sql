-- Create function to handle project invitation acceptance
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

-- Create trigger for project invitation acceptance
DROP TRIGGER IF EXISTS handle_invitation_acceptance_trigger ON public.project_invitations;
CREATE TRIGGER handle_invitation_acceptance_trigger
  AFTER UPDATE ON public.project_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_project_invitation_acceptance();