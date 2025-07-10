-- First, update any existing users/invitations with the roles we're removing
UPDATE public.user_roles 
SET role = 'client_viewer' 
WHERE role IN ('project_admin', 'estimator', 'admin', 'user');

UPDATE public.user_invitations 
SET invited_role = 'client_viewer' 
WHERE invited_role IN ('project_admin', 'estimator', 'admin', 'user');

-- Drop all functions that depend on user_role enum
DROP FUNCTION IF EXISTS public.get_user_role(uuid);
DROP FUNCTION IF EXISTS public.get_current_user_role();
DROP FUNCTION IF EXISTS public.has_role_or_higher(user_role);
DROP FUNCTION IF EXISTS public.get_role_level(user_role);

-- Drop all RLS policies that reference the old roles
DROP POLICY IF EXISTS "Project managers and above can create projects" ON public.projects;
DROP POLICY IF EXISTS "Project managers and above can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins and above can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Project admins and above can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Project admins and above can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Project managers and above can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "Consultants and above can view leads" ON public.leads;
DROP POLICY IF EXISTS "Consultants and above can create leads" ON public.leads;
DROP POLICY IF EXISTS "Consultants and above can update leads" ON public.leads;
DROP POLICY IF EXISTS "Project managers and above can delete leads" ON public.leads;
DROP POLICY IF EXISTS "Project admins and above can create digital objects" ON public.digital_objects;
DROP POLICY IF EXISTS "Project admins and above can update digital objects" ON public.digital_objects;
DROP POLICY IF EXISTS "Project managers and above can delete digital objects" ON public.digital_objects;
DROP POLICY IF EXISTS "Project admins and above can create WBS items" ON public.wbs_items;
DROP POLICY IF EXISTS "Project admins and above can update WBS items" ON public.wbs_items;
DROP POLICY IF EXISTS "Project managers and above can delete WBS items" ON public.wbs_items;
DROP POLICY IF EXISTS "Project admins and above can create subtasks" ON public.subtasks;
DROP POLICY IF EXISTS "Project admins and above can update subtasks" ON public.subtasks;
DROP POLICY IF EXISTS "Project managers and above can delete subtasks" ON public.subtasks;
DROP POLICY IF EXISTS "Project managers and above can delete task comments" ON public.task_comments;
DROP POLICY IF EXISTS "Project managers and above can delete task attachments" ON public.task_attachments;
DROP POLICY IF EXISTS "Project managers and above can create team members" ON public.team_members;
DROP POLICY IF EXISTS "Project managers and above can update team members" ON public.team_members;
DROP POLICY IF EXISTS "Project managers and above can delete team members" ON public.team_members;
DROP POLICY IF EXISTS "Project managers and above can create team invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Project managers and above can update team invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Project managers and above can create member permissions" ON public.member_permissions;
DROP POLICY IF EXISTS "Project managers and above can update member permissions" ON public.member_permissions;
DROP POLICY IF EXISTS "Project managers and above can create project access settings" ON public.project_access_settings;
DROP POLICY IF EXISTS "Project managers and above can update project access settings" ON public.project_access_settings;
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;