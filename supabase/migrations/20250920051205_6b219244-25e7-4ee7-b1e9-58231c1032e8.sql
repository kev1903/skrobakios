-- Update the company_members role check constraint to include the new roles
ALTER TABLE public.company_members 
DROP CONSTRAINT company_members_role_check;

-- Add updated constraint with new roles
ALTER TABLE public.company_members 
ADD CONSTRAINT company_members_role_check 
CHECK (role = ANY (ARRAY['owner'::text, 'admin'::text, 'platform_admin'::text, 'director'::text, 'manager'::text, 'worker'::text, 'supplier'::text, 'sub_contractor'::text, 'consultant'::text, 'client'::text]));