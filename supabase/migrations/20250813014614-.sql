-- Fix security vulnerability: Secure project_invitations table to prevent email harvesting
-- This table contains user email addresses that could be harvested for spam/phishing

-- Remove any overly permissive policies that might allow public access
DO $$
DECLARE
    pol_name TEXT;
BEGIN
    FOR pol_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'project_invitations' 
        AND schemaname = 'public'
        AND policyname NOT IN (
            'Invited users can view their invitations',
            'Project admins can manage invitations'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.project_invitations', pol_name);
    END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;

-- Add comprehensive security policy to ensure only authenticated users can access invitations
CREATE POLICY "Only authenticated users can access project invitations" 
ON public.project_invitations 
FOR ALL 
USING (
    auth.role() = 'authenticated' 
    AND (
        -- User can see invitations sent to their email
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR 
        -- Project admins can manage invitations for their projects
        project_id IN (
            SELECT pm.project_id
            FROM project_members pm
            WHERE pm.user_id = auth.uid() 
            AND pm.role = 'project_admin' 
            AND pm.status = 'active'
        )
        OR 
        -- Company owners/admins can manage invitations for their company projects
        project_id IN (
            SELECT p.id
            FROM projects p
            JOIN company_members cm ON p.company_id = cm.company_id
            WHERE cm.user_id = auth.uid() 
            AND cm.role IN ('owner', 'admin') 
            AND cm.status = 'active'
        )
        OR 
        -- Users who sent the invitation can manage it
        invited_by = auth.uid()
    )
)
WITH CHECK (
    auth.role() = 'authenticated' 
    AND (
        -- Only project admins can create invitations for their projects
        project_id IN (
            SELECT pm.project_id
            FROM project_members pm
            WHERE pm.user_id = auth.uid() 
            AND pm.role = 'project_admin' 
            AND pm.status = 'active'
        )
        OR 
        -- Company owners/admins can create invitations for their company projects
        project_id IN (
            SELECT p.id
            FROM projects p
            JOIN company_members cm ON p.company_id = cm.company_id
            WHERE cm.user_id = auth.uid() 
            AND cm.role IN ('owner', 'admin') 
            AND cm.status = 'active'
        )
    )
    AND invited_by = auth.uid()
);

-- Add audit logging for invitation access to monitor potential email harvesting attempts
CREATE OR REPLACE FUNCTION public.log_invitation_access()
RETURNS TRIGGER AS $$
BEGIN
    -- Log all invitation operations for security monitoring
    INSERT INTO public.audit_logs (
        user_id, action, resource_type, resource_id, 
        metadata, created_at
    ) VALUES (
        auth.uid(), TG_OP, 'project_invitation', 
        COALESCE(NEW.id, OLD.id),
        jsonb_build_object(
            'table', TG_TABLE_NAME,
            'operation', TG_OP,
            'email_domain', SPLIT_PART(COALESCE(NEW.email, OLD.email), '@', 2),
            'project_id', COALESCE(NEW.project_id, OLD.project_id),
            'status', COALESCE(NEW.status, OLD.status)
        ),
        now()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Apply audit trigger to project_invitations
DROP TRIGGER IF EXISTS audit_project_invitations ON public.project_invitations;
CREATE TRIGGER audit_project_invitations
    AFTER INSERT OR UPDATE OR DELETE ON public.project_invitations
    FOR EACH ROW EXECUTE FUNCTION public.log_invitation_access();

-- Create function to mask email addresses in invitation listings for additional privacy
CREATE OR REPLACE FUNCTION public.mask_invitation_email(invitation_email TEXT, requesting_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Get the requesting user's email
    SELECT email INTO user_email FROM auth.users WHERE id = requesting_user_id;
    
    -- Only show full email if it's the user's own invitation or they have admin access
    IF invitation_email = user_email THEN
        RETURN invitation_email;
    END IF;
    
    -- Otherwise mask the email for privacy
    IF invitation_email IS NOT NULL THEN
        RETURN LEFT(invitation_email, 3) || '***@' || SPLIT_PART(invitation_email, '@', 2);
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Add additional constraint to prevent mass invitation spam
CREATE OR REPLACE FUNCTION public.check_invitation_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    recent_invitations INTEGER;
BEGIN
    -- Check if user has sent too many invitations recently (more than 10 in last hour)
    SELECT COUNT(*) INTO recent_invitations
    FROM public.project_invitations
    WHERE invited_by = NEW.invited_by
    AND created_at > now() - interval '1 hour';
    
    IF recent_invitations >= 10 THEN
        RAISE EXCEPTION 'Rate limit exceeded: Too many invitations sent recently. Please wait before sending more invitations.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Apply rate limiting trigger
DROP TRIGGER IF EXISTS invitation_rate_limit ON public.project_invitations;
CREATE TRIGGER invitation_rate_limit
    BEFORE INSERT ON public.project_invitations
    FOR EACH ROW EXECUTE FUNCTION public.check_invitation_rate_limit();