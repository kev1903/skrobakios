-- Remove role-based RLS policies first
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
DROP FUNCTION IF EXISTS public.get_current_user_role();
DROP FUNCTION IF EXISTS public.get_user_role(uuid);
DROP FUNCTION IF EXISTS public.is_superadmin(uuid);
DROP FUNCTION IF EXISTS public.has_role_or_higher(user_role);
DROP FUNCTION IF EXISTS public.has_minimum_role_level(integer);
DROP FUNCTION IF EXISTS public.get_role_level(user_role);
DROP FUNCTION IF EXISTS public.validate_role_permissions();
DROP FUNCTION IF EXISTS public.log_sensitive_operation();
DROP FUNCTION IF EXISTS public.handle_new_user_role();
DROP FUNCTION IF EXISTS public.handle_user_signup();

-- Remove triggers that use role functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the user_roles table
DROP TABLE IF EXISTS public.user_roles;

-- Drop the user_role enum type
DROP TYPE IF EXISTS public.user_role;

-- Create simple RLS policies for basic authentication
CREATE POLICY "Authenticated users can view leads" ON public.leads
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create leads" ON public.leads
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update leads" ON public.leads
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete leads" ON public.leads
FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage digital objects" ON public.digital_objects
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage projects" ON public.projects
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage subtasks" ON public.subtasks
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage task attachments" ON public.task_attachments
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage task comments" ON public.task_comments
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage tasks" ON public.tasks
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage WBS items" ON public.wbs_items
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage system configurations" ON public.system_configurations
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage project access settings" ON public.project_access_settings
FOR ALL USING (auth.role() = 'authenticated');

-- Update profiles policies to remove role-based restrictions
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update all profiles" ON public.profiles
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete all profiles" ON public.profiles
FOR DELETE USING (auth.role() = 'authenticated');

-- Create simple user signup trigger without roles
CREATE OR REPLACE FUNCTION public.handle_simple_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create a simple active profile
  INSERT INTO public.profiles (user_id, first_name, last_name, email, status)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email,
    'active'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for simple user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_simple_user_signup();