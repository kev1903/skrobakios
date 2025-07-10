-- Create comprehensive role-based access control system

-- First, create helper functions for role checking
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.has_role_or_higher(required_role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT CASE 
    WHEN required_role = 'client_viewer' THEN 
      get_current_user_role() IN ('client_viewer', 'accounts', 'estimator', 'subcontractor', 'consultant', 'project_admin', 'project_manager', 'user', 'admin', 'superadmin')
    WHEN required_role = 'accounts' THEN 
      get_current_user_role() IN ('accounts', 'estimator', 'subcontractor', 'consultant', 'project_admin', 'project_manager', 'user', 'admin', 'superadmin')
    WHEN required_role = 'estimator' THEN 
      get_current_user_role() IN ('estimator', 'subcontractor', 'consultant', 'project_admin', 'project_manager', 'user', 'admin', 'superadmin')
    WHEN required_role = 'subcontractor' THEN 
      get_current_user_role() IN ('subcontractor', 'consultant', 'project_admin', 'project_manager', 'user', 'admin', 'superadmin')
    WHEN required_role = 'consultant' THEN 
      get_current_user_role() IN ('consultant', 'project_admin', 'project_manager', 'user', 'admin', 'superadmin')
    WHEN required_role = 'project_admin' THEN 
      get_current_user_role() IN ('project_admin', 'project_manager', 'user', 'admin', 'superadmin')
    WHEN required_role = 'project_manager' THEN 
      get_current_user_role() IN ('project_manager', 'user', 'admin', 'superadmin')
    WHEN required_role = 'user' THEN 
      get_current_user_role() IN ('user', 'admin', 'superadmin')
    WHEN required_role = 'admin' THEN 
      get_current_user_role() IN ('admin', 'superadmin')
    WHEN required_role = 'superadmin' THEN 
      get_current_user_role() = 'superadmin'
    ELSE false
  END;
$$;

-- Drop existing overly permissive policies and create secure ones

-- PROJECTS TABLE - Secure access control
DROP POLICY IF EXISTS "Anyone can create projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can update projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;

CREATE POLICY "Authenticated users can view projects" ON public.projects
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Project managers and above can create projects" ON public.projects
FOR INSERT TO authenticated
WITH CHECK (has_role_or_higher('project_manager'));

CREATE POLICY "Project managers and above can update projects" ON public.projects
FOR UPDATE TO authenticated
USING (has_role_or_higher('project_manager'));

CREATE POLICY "Admins and above can delete projects" ON public.projects
FOR DELETE TO authenticated
USING (has_role_or_higher('admin'));

-- TASKS TABLE - Secure access control
DROP POLICY IF EXISTS "Anyone can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anyone can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anyone can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anyone can view tasks" ON public.tasks;

CREATE POLICY "Authenticated users can view tasks" ON public.tasks
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Project admins and above can create tasks" ON public.tasks
FOR INSERT TO authenticated
WITH CHECK (has_role_or_higher('project_admin'));

CREATE POLICY "Project admins and above can update tasks" ON public.tasks
FOR UPDATE TO authenticated
USING (has_role_or_higher('project_admin'));

CREATE POLICY "Project managers and above can delete tasks" ON public.tasks
FOR DELETE TO authenticated
USING (has_role_or_higher('project_manager'));

-- LEADS TABLE - Secure access control
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can delete leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can update leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can view leads" ON public.leads;

CREATE POLICY "Consultants and above can view leads" ON public.leads
FOR SELECT TO authenticated
USING (has_role_or_higher('consultant'));

CREATE POLICY "Consultants and above can create leads" ON public.leads
FOR INSERT TO authenticated
WITH CHECK (has_role_or_higher('consultant'));

CREATE POLICY "Consultants and above can update leads" ON public.leads
FOR UPDATE TO authenticated
USING (has_role_or_higher('consultant'));

CREATE POLICY "Project managers and above can delete leads" ON public.leads
FOR DELETE TO authenticated
USING (has_role_or_higher('project_manager'));

-- DIGITAL OBJECTS TABLE - Secure access control
DROP POLICY IF EXISTS "Anyone can create digital objects" ON public.digital_objects;
DROP POLICY IF EXISTS "Anyone can delete digital objects" ON public.digital_objects;
DROP POLICY IF EXISTS "Anyone can update digital objects" ON public.digital_objects;
DROP POLICY IF EXISTS "Anyone can view digital objects" ON public.digital_objects;

CREATE POLICY "Authenticated users can view digital objects" ON public.digital_objects
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Project admins and above can create digital objects" ON public.digital_objects
FOR INSERT TO authenticated
WITH CHECK (has_role_or_higher('project_admin'));

CREATE POLICY "Project admins and above can update digital objects" ON public.digital_objects
FOR UPDATE TO authenticated
USING (has_role_or_higher('project_admin'));

CREATE POLICY "Project managers and above can delete digital objects" ON public.digital_objects
FOR DELETE TO authenticated
USING (has_role_or_higher('project_manager'));

-- WBS ITEMS TABLE - Secure access control
DROP POLICY IF EXISTS "Anyone can create WBS items" ON public.wbs_items;
DROP POLICY IF EXISTS "Anyone can delete WBS items" ON public.wbs_items;
DROP POLICY IF EXISTS "Anyone can update WBS items" ON public.wbs_items;
DROP POLICY IF EXISTS "Anyone can view WBS items" ON public.wbs_items;

CREATE POLICY "Authenticated users can view WBS items" ON public.wbs_items
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Project admins and above can create WBS items" ON public.wbs_items
FOR INSERT TO authenticated
WITH CHECK (has_role_or_higher('project_admin'));

CREATE POLICY "Project admins and above can update WBS items" ON public.wbs_items
FOR UPDATE TO authenticated
USING (has_role_or_higher('project_admin'));

CREATE POLICY "Project managers and above can delete WBS items" ON public.wbs_items
FOR DELETE TO authenticated
USING (has_role_or_higher('project_manager'));

-- SUBTASKS TABLE - Secure access control
DROP POLICY IF EXISTS "Anyone can create subtasks" ON public.subtasks;
DROP POLICY IF EXISTS "Anyone can delete subtasks" ON public.subtasks;
DROP POLICY IF EXISTS "Anyone can update subtasks" ON public.subtasks;
DROP POLICY IF EXISTS "Anyone can view subtasks" ON public.subtasks;

CREATE POLICY "Authenticated users can view subtasks" ON public.subtasks
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Project admins and above can create subtasks" ON public.subtasks
FOR INSERT TO authenticated
WITH CHECK (has_role_or_higher('project_admin'));

CREATE POLICY "Project admins and above can update subtasks" ON public.subtasks
FOR UPDATE TO authenticated
USING (has_role_or_higher('project_admin'));

CREATE POLICY "Project managers and above can delete subtasks" ON public.subtasks
FOR DELETE TO authenticated
USING (has_role_or_higher('project_manager'));

-- TASK COMMENTS TABLE - Secure access control
DROP POLICY IF EXISTS "Anyone can create task comments" ON public.task_comments;
DROP POLICY IF EXISTS "Anyone can delete task comments" ON public.task_comments;
DROP POLICY IF EXISTS "Anyone can update task comments" ON public.task_comments;
DROP POLICY IF EXISTS "Anyone can view task comments" ON public.task_comments;

CREATE POLICY "Authenticated users can view task comments" ON public.task_comments
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create task comments" ON public.task_comments
FOR INSERT TO authenticated
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own task comments" ON public.task_comments
FOR UPDATE TO authenticated
USING (user_name = (SELECT CONCAT(first_name, ' ', last_name) FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Project managers and above can delete task comments" ON public.task_comments
FOR DELETE TO authenticated
USING (has_role_or_higher('project_manager'));

-- TASK ATTACHMENTS TABLE - Secure access control
DROP POLICY IF EXISTS "Anyone can create task attachments" ON public.task_attachments;
DROP POLICY IF EXISTS "Anyone can delete task attachments" ON public.task_attachments;
DROP POLICY IF EXISTS "Anyone can update task attachments" ON public.task_attachments;
DROP POLICY IF EXISTS "Anyone can view task attachments" ON public.task_attachments;

CREATE POLICY "Authenticated users can view task attachments" ON public.task_attachments
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create task attachments" ON public.task_attachments
FOR INSERT TO authenticated
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own task attachments" ON public.task_attachments
FOR UPDATE TO authenticated
USING (uploaded_by_name = (SELECT CONCAT(first_name, ' ', last_name) FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Project managers and above can delete task attachments" ON public.task_attachments
FOR DELETE TO authenticated
USING (has_role_or_higher('project_manager'));

-- TEAM MEMBERS TABLE - Secure access control
DROP POLICY IF EXISTS "Anyone can create team members" ON public.team_members;
DROP POLICY IF EXISTS "Anyone can delete team members" ON public.team_members;
DROP POLICY IF EXISTS "Anyone can update team members" ON public.team_members;
DROP POLICY IF EXISTS "Anyone can view team members" ON public.team_members;

CREATE POLICY "Authenticated users can view team members" ON public.team_members
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Project managers and above can create team members" ON public.team_members
FOR INSERT TO authenticated
WITH CHECK (has_role_or_higher('project_manager'));

CREATE POLICY "Project managers and above can update team members" ON public.team_members
FOR UPDATE TO authenticated
USING (has_role_or_higher('project_manager'));

CREATE POLICY "Project managers and above can delete team members" ON public.team_members
FOR DELETE TO authenticated
USING (has_role_or_higher('project_manager'));

-- TEAM INVITATIONS TABLE - Secure access control
DROP POLICY IF EXISTS "Anyone can create team invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Anyone can update team invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Anyone can view team invitations" ON public.team_invitations;

CREATE POLICY "Authenticated users can view team invitations" ON public.team_invitations
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Project managers and above can create team invitations" ON public.team_invitations
FOR INSERT TO authenticated
WITH CHECK (has_role_or_higher('project_manager'));

CREATE POLICY "Project managers and above can update team invitations" ON public.team_invitations
FOR UPDATE TO authenticated
USING (has_role_or_higher('project_manager'));

-- MEMBER PERMISSIONS TABLE - Secure access control
DROP POLICY IF EXISTS "Anyone can create member permissions" ON public.member_permissions;
DROP POLICY IF EXISTS "Anyone can update member permissions" ON public.member_permissions;
DROP POLICY IF EXISTS "Anyone can view member permissions" ON public.member_permissions;

CREATE POLICY "Authenticated users can view member permissions" ON public.member_permissions
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Project managers and above can create member permissions" ON public.member_permissions
FOR INSERT TO authenticated
WITH CHECK (has_role_or_higher('project_manager'));

CREATE POLICY "Project managers and above can update member permissions" ON public.member_permissions
FOR UPDATE TO authenticated
USING (has_role_or_higher('project_manager'));

-- PROJECT ACCESS SETTINGS TABLE - Secure access control
DROP POLICY IF EXISTS "Anyone can create project access settings" ON public.project_access_settings;
DROP POLICY IF EXISTS "Anyone can update project access settings" ON public.project_access_settings;
DROP POLICY IF EXISTS "Anyone can view project access settings" ON public.project_access_settings;

CREATE POLICY "Authenticated users can view project access settings" ON public.project_access_settings
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Project managers and above can create project access settings" ON public.project_access_settings
FOR INSERT TO authenticated
WITH CHECK (has_role_or_higher('project_manager'));

CREATE POLICY "Project managers and above can update project access settings" ON public.project_access_settings
FOR UPDATE TO authenticated
USING (has_role_or_higher('project_manager'));

-- Ensure financial data is properly secured
-- ESTIMATES TABLE - Already has proper policies, but let's verify
-- ESTIMATE LINE ITEMS TABLE - Already has proper policies

-- Add audit logging function for sensitive operations
CREATE OR REPLACE FUNCTION public.log_sensitive_operation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log the operation to task_activity_log for audit purposes
  IF TG_OP = 'DELETE' THEN
    INSERT INTO task_activity_log (
      task_id, 
      action_type, 
      action_description, 
      user_name, 
      user_avatar
    ) VALUES (
      COALESCE(OLD.id::text, 'system'),
      'ADMIN_DELETE',
      'Record deleted from ' || TG_TABLE_NAME || ' by user with role: ' || get_current_user_role(),
      COALESCE((SELECT CONCAT(first_name, ' ', last_name) FROM profiles WHERE user_id = auth.uid()), 'System'),
      (SELECT avatar_url FROM profiles WHERE user_id = auth.uid())
    );
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;