-- Phase 1: Fix Critical Data Exposure Issues (Updated)

-- 1. Secure xero_invoices table - first check and drop existing policies
DROP POLICY IF EXISTS "Users can view their own Xero invoices" ON public.xero_invoices;
DROP POLICY IF EXISTS "Users can manage their own Xero invoices" ON public.xero_invoices;
DROP POLICY IF EXISTS "Service can manage Xero invoices during sync" ON public.xero_invoices;

-- Create secure policies for xero_invoices
CREATE POLICY "Users can view their own Xero invoices" 
ON public.xero_invoices 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own Xero invoices" 
ON public.xero_invoices 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Xero invoices" 
ON public.xero_invoices 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow service role for sync operations
CREATE POLICY "Service can manage Xero invoices during sync" 
ON public.xero_invoices 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- 2. Drop existing estimate policies and create secure ones
DROP POLICY IF EXISTS "Company members can view estimates" ON public.estimates;
DROP POLICY IF EXISTS "Company members can manage estimates" ON public.estimates;
DROP POLICY IF EXISTS "Authenticated users can create estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can update estimates they created" ON public.estimates;
DROP POLICY IF EXISTS "Users can delete estimates they created" ON public.estimates;

CREATE POLICY "Company members can view estimates" 
ON public.estimates 
FOR SELECT 
USING (company_id IN (
  SELECT cm.company_id 
  FROM company_members cm 
  WHERE cm.user_id = auth.uid() 
  AND cm.status = 'active'
));

CREATE POLICY "Company members can create estimates" 
ON public.estimates 
FOR INSERT 
WITH CHECK (company_id IN (
  SELECT cm.company_id 
  FROM company_members cm 
  WHERE cm.user_id = auth.uid() 
  AND cm.status = 'active'
));

CREATE POLICY "Estimate creators can update their estimates" 
ON public.estimates 
FOR UPDATE 
USING (auth.uid() = created_by OR auth.uid() = last_modified_by)
WITH CHECK (company_id IN (
  SELECT cm.company_id 
  FROM company_members cm 
  WHERE cm.user_id = auth.uid() 
  AND cm.status = 'active'
));

CREATE POLICY "Estimate creators can delete their estimates" 
ON public.estimates 
FOR DELETE 
USING (auth.uid() = created_by);

-- 3. Drop existing WBS policies and create secure ones
DROP POLICY IF EXISTS "Project members can view WBS items" ON public.wbs_items;
DROP POLICY IF EXISTS "Project members can manage WBS items" ON public.wbs_items;

CREATE POLICY "Project members can view WBS items" 
ON public.wbs_items 
FOR SELECT 
USING (
  project_id IN (
    SELECT pm.project_id 
    FROM project_members pm 
    WHERE pm.user_id = auth.uid() 
    AND pm.status = 'active'
  ) 
  OR company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.role IN ('owner', 'admin') 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Project members can manage WBS items" 
ON public.wbs_items 
FOR ALL 
USING (
  project_id IN (
    SELECT pm.project_id 
    FROM project_members pm 
    WHERE pm.user_id = auth.uid() 
    AND pm.status = 'active'
  ) 
  OR company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.role IN ('owner', 'admin') 
    AND cm.status = 'active'
  )
)
WITH CHECK (
  project_id IN (
    SELECT pm.project_id 
    FROM project_members pm 
    WHERE pm.user_id = auth.uid() 
    AND pm.status = 'active'
  ) 
  OR company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.role IN ('owner', 'admin') 
    AND cm.status = 'active'
  )
);