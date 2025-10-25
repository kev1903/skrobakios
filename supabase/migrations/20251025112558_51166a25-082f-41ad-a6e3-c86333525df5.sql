
-- Drop all existing RLS policies on invoice_items
DROP POLICY IF EXISTS "Users can view invoice items for their company projects" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can insert invoice items for their company projects" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can update invoice items for their company projects" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can delete invoice items for their company projects" ON public.invoice_items;

-- Create simpler RLS policies that avoid the table reference issue
-- by using a function with proper search_path

CREATE OR REPLACE FUNCTION public.user_can_access_invoice(invoice_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.invoices i
    JOIN public.projects p ON i.project_id = p.id
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE i.id = invoice_id_param
    AND cm.user_id = auth.uid()
    AND cm.status = 'active'
  );
$$;

-- Now create RLS policies using this function
CREATE POLICY "Users can view invoice items for their company projects"
ON public.invoice_items
FOR SELECT
USING (public.user_can_access_invoice(invoice_id));

CREATE POLICY "Users can insert invoice items for their company projects"
ON public.invoice_items
FOR INSERT
WITH CHECK (public.user_can_access_invoice(invoice_id));

CREATE POLICY "Users can update invoice items for their company projects"
ON public.invoice_items
FOR UPDATE
USING (public.user_can_access_invoice(invoice_id));

CREATE POLICY "Users can delete invoice items for their company projects"
ON public.invoice_items
FOR DELETE
USING (public.user_can_access_invoice(invoice_id));

-- Grant execute on the helper function
GRANT EXECUTE ON FUNCTION public.user_can_access_invoice(uuid) TO authenticated;
