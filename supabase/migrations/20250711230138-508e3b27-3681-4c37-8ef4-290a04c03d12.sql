-- Add RLS policies for owner role to have access to company and project operations

-- Owners can update companies (similar to superadmins but more focused on company operations)
CREATE POLICY "Owners can update companies" 
ON public.companies 
FOR UPDATE 
USING (has_role(auth.uid(), 'owner'::app_role))
WITH CHECK (has_role(auth.uid(), 'owner'::app_role));

-- Owners can view user roles
CREATE POLICY "Owners can view user roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'owner'::app_role));

-- Owners can manage company members across all companies
CREATE POLICY "Owners can manage all company members" 
ON public.company_members 
FOR ALL 
USING (has_role(auth.uid(), 'owner'::app_role))
WITH CHECK (has_role(auth.uid(), 'owner'::app_role));

-- Owners can manage all projects
CREATE POLICY "Owners can manage all projects" 
ON public.projects 
FOR ALL 
USING (has_role(auth.uid(), 'owner'::app_role))
WITH CHECK (has_role(auth.uid(), 'owner'::app_role));

-- Owners can manage all leads
CREATE POLICY "Owners can manage all leads" 
ON public.leads 
FOR ALL 
USING (has_role(auth.uid(), 'owner'::app_role))
WITH CHECK (has_role(auth.uid(), 'owner'::app_role));