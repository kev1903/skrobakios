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

CREATE POLICY "Authenticated users can create notifications" ON public.notifications
FOR INSERT WITH CHECK (auth.role() = 'authenticated');