-- Add missing RLS policies for company_modules table to allow company owners/admins to manage modules

-- Allow company owners and admins to insert new module records
CREATE POLICY "Company owners can insert company modules" 
ON public.company_modules 
FOR INSERT 
TO public 
WITH CHECK (is_company_admin_or_owner(company_id, auth.uid()));

-- Allow company owners and admins to update module status
CREATE POLICY "Company owners can update company modules" 
ON public.company_modules 
FOR UPDATE 
TO public 
USING (is_company_admin_or_owner(company_id, auth.uid()))
WITH CHECK (is_company_admin_or_owner(company_id, auth.uid()));

-- Allow company owners and admins to delete modules if needed
CREATE POLICY "Company owners can delete company modules" 
ON public.company_modules 
FOR DELETE 
TO public 
USING (is_company_admin_or_owner(company_id, auth.uid()));