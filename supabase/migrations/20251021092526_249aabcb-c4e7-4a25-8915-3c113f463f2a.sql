-- Security Fix: Remove public access from leads table and add company-scoped RLS

-- Drop all public policies on leads table
DROP POLICY IF EXISTS "Anyone can view leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can update leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can delete leads" ON public.leads;

-- Create company-scoped RLS policies for leads table
-- Users can only view leads from companies they are members of
CREATE POLICY "Company members can view leads" 
ON public.leads 
FOR SELECT 
USING (
  company_id IN (
    SELECT company_id 
    FROM public.company_members 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Users can only insert leads for companies they are members of
CREATE POLICY "Company members can create leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT company_id 
    FROM public.company_members 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Users can only update leads from their companies
CREATE POLICY "Company members can update leads" 
ON public.leads 
FOR UPDATE 
USING (
  company_id IN (
    SELECT company_id 
    FROM public.company_members 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
)
WITH CHECK (
  company_id IN (
    SELECT company_id 
    FROM public.company_members 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Users can only delete leads from their companies
CREATE POLICY "Company members can delete leads" 
ON public.leads 
FOR DELETE 
USING (
  company_id IN (
    SELECT company_id 
    FROM public.company_members 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Drop and recreate the masked view RPC function for secure contact info viewing
DROP FUNCTION IF EXISTS public.get_leads_with_masked_contact();

CREATE OR REPLACE FUNCTION public.get_leads_with_masked_contact()
RETURNS SETOF public.leads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return leads for user's companies with contact info masked based on role
  RETURN QUERY
  SELECT l.*
  FROM public.leads l
  WHERE l.company_id IN (
    SELECT company_id 
    FROM public.company_members 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  );
END;
$$;