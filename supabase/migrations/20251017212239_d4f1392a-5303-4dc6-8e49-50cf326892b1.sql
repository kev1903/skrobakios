-- Add foreign key constraint from invoice_items to invoices
ALTER TABLE public.invoice_items
DROP CONSTRAINT IF EXISTS invoice_items_invoice_id_fkey;

ALTER TABLE public.invoice_items
ADD CONSTRAINT invoice_items_invoice_id_fkey 
FOREIGN KEY (invoice_id) 
REFERENCES public.invoices(id) 
ON DELETE CASCADE;

-- Ensure RLS is enabled on invoice_items
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage invoice items" ON public.invoice_items;

-- Create comprehensive RLS policies for invoice_items
CREATE POLICY "Users can view invoice items for their projects"
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

CREATE POLICY "Users can create invoice items for their projects"
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

CREATE POLICY "Users can update invoice items for their projects"
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

CREATE POLICY "Users can delete invoice items for their projects"
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