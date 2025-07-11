-- Remove all triggers that depend on role functions first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;

-- Remove role-based RLS policies
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Consultants and above can create leads" ON public.leads;
DROP POLICY IF EXISTS "Consultants and above can update leads" ON public.leads;
DROP POLICY IF EXISTS "Consultants and above can view leads" ON public.leads;
DROP POLICY IF EXISTS "Project managers and above can delete leads" ON public.leads;
DROP POLICY IF EXISTS "Project managers and above can delete digital objects" ON public.digital_objects;
DROP POLICY IF EXISTS "Project managers and above can create project access settings" ON public.project_access_settings;
DROP POLICY IF EXISTS "Project managers and above can update project access settings" ON public.project_access_settings;
DROP POLICY IF EXISTS "Project managers and above can create projects" ON public.projects;
DROP POLICY IF EXISTS "Project managers and above can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins and above can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Project admins and above can create subtasks" ON public.subtasks;
DROP POLICY IF EXISTS "Project admins and above can update subtasks" ON public.subtasks;
DROP POLICY IF EXISTS "Project managers and above can delete subtasks" ON public.subtasks;
DROP POLICY IF EXISTS "Project managers and above can delete task attachments" ON public.task_attachments;
DROP POLICY IF EXISTS "Project managers and above can delete task comments" ON public.task_comments;
DROP POLICY IF EXISTS "Project managers and above can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "Project admins and above can create WBS items" ON public.wbs_items;
DROP POLICY IF EXISTS "Project admins and above can update WBS items" ON public.wbs_items;
DROP POLICY IF EXISTS "Project managers and above can delete WBS items" ON public.wbs_items;
DROP POLICY IF EXISTS "Superadmin can manage system configurations" ON public.system_configurations;
DROP POLICY IF EXISTS "Superadmin can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmin can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmin can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmin can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmin can create invited profiles" ON public.profiles;
DROP POLICY IF EXISTS "Superadmin can delete all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Superadmin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Superadmin can view all profiles" ON public.profiles;

-- Remove role-related functions
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_superadmin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.has_role_or_higher(user_role) CASCADE;
DROP FUNCTION IF EXISTS public.has_minimum_role_level(integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_role_level(user_role) CASCADE;
DROP FUNCTION IF EXISTS public.validate_role_permissions() CASCADE;
DROP FUNCTION IF EXISTS public.log_sensitive_operation() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_signup() CASCADE;

-- Drop the user_roles table
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Drop the user_role enum type
DROP TYPE IF EXISTS public.user_role CASCADE;