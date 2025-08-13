-- Fix security vulnerability: Remove public access to estimate_line_items table
-- This table contains sensitive pricing information that should only be accessible to authorized users

-- Remove ALL existing policies first
DO $$
DECLARE
    pol_name TEXT;
BEGIN
    FOR pol_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'estimate_line_items' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.estimate_line_items', pol_name);
    END LOOP;
END $$;

-- Create secure RLS policies that only allow company members to access their estimate line items
-- Users can only view estimate line items for estimates in their company
CREATE POLICY "Company members can view their estimate line items" 
ON public.estimate_line_items 
FOR SELECT 
USING (
  estimate_id IN (
    SELECT e.id 
    FROM estimates e
    JOIN company_members cm ON e.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- Users can only insert estimate line items for estimates in their company
CREATE POLICY "Company members can create estimate line items" 
ON public.estimate_line_items 
FOR INSERT 
WITH CHECK (
  estimate_id IN (
    SELECT e.id 
    FROM estimates e
    JOIN company_members cm ON e.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- Users can only update estimate line items for estimates in their company
CREATE POLICY "Company members can update their estimate line items" 
ON public.estimate_line_items 
FOR UPDATE 
USING (
  estimate_id IN (
    SELECT e.id 
    FROM estimates e
    JOIN company_members cm ON e.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
)
WITH CHECK (
  estimate_id IN (
    SELECT e.id 
    FROM estimates e
    JOIN company_members cm ON e.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- Users can only delete estimate line items for estimates in their company
CREATE POLICY "Company members can delete their estimate line items" 
ON public.estimate_line_items 
FOR DELETE 
USING (
  estimate_id IN (
    SELECT e.id 
    FROM estimates e
    JOIN company_members cm ON e.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- Ensure RLS is enabled on the table
ALTER TABLE public.estimate_line_items ENABLE ROW LEVEL SECURITY;