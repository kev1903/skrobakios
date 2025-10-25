-- Drop the existing overly permissive policy on invoice_items
DROP POLICY IF EXISTS "Authenticated users can manage their invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can manage invoice items" ON public.invoice_items;

-- Create proper RLS policies that check project access through the invoice
CREATE POLICY "Users can view invoice items for their company projects"
ON public.invoice_items
FOR SELECT
USING (
  invoice_id IN (
    SELECT i.id
    FROM invoices i
    JOIN projects p ON i.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
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
    FROM invoices i
    JOIN projects p ON i.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
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
    FROM invoices i
    JOIN projects p ON i.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
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
    FROM invoices i
    JOIN projects p ON i.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid()
    AND cm.status = 'active'
  )
);