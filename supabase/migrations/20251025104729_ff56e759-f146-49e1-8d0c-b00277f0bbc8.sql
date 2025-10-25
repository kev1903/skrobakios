-- Drop the policies with incorrect table references
DROP POLICY IF EXISTS "Users can view invoice items for their company projects" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can insert invoice items for their company projects" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can update invoice items for their company projects" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can delete invoice items for their company projects" ON public.invoice_items;

-- Recreate with fully qualified table names
CREATE POLICY "Users can view invoice items for their company projects"
ON public.invoice_items
FOR SELECT
USING (
  invoice_id IN (
    SELECT i.id
    FROM public.invoices i
    JOIN public.projects p ON i.project_id = p.id
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid()
    AND cm.status = 'active'
  )
);

CREATE POLICY "Users can insert invoice items for their company projects"
ON public.invoice_items
FOR INSERT
WITH CHECK (
  invoice_id IN (
    SELECT i.id
    FROM public.invoices i
    JOIN public.projects p ON i.project_id = p.id
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid()
    AND cm.status = 'active'
  )
);

CREATE POLICY "Users can update invoice items for their company projects"
ON public.invoice_items
FOR UPDATE
USING (
  invoice_id IN (
    SELECT i.id
    FROM public.invoices i
    JOIN public.projects p ON i.project_id = p.id
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid()
    AND cm.status = 'active'
  )
);

CREATE POLICY "Users can delete invoice items for their company projects"
ON public.invoice_items
FOR DELETE
USING (
  invoice_id IN (
    SELECT i.id
    FROM public.invoices i
    JOIN public.projects p ON i.project_id = p.id
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid()
    AND cm.status = 'active'
  )
);