-- Add missing fields to bills table for better functionality
ALTER TABLE public.bills 
ADD COLUMN IF NOT EXISTS reference_number TEXT,
ADD COLUMN IF NOT EXISTS file_attachments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS forwarded_bill BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS source_system TEXT;

-- Update bills table to include an index for better performance
CREATE INDEX IF NOT EXISTS idx_bills_project_status ON public.bills(project_id, status);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON public.bills(due_date);

-- Add some sample data if the table is empty (for demonstration)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.bills LIMIT 1) THEN
    -- Insert sample bills for demonstration
    INSERT INTO public.bills (
      project_id, 
      supplier_name, 
      supplier_email,
      bill_no,
      reference_number,
      bill_date,
      due_date,
      status,
      subtotal,
      tax,
      total,
      file_attachments,
      forwarded_bill,
      created_by
    ) VALUES 
    (
      (SELECT id FROM public.projects LIMIT 1),
      'Bunnings Group Limited',
      'accounts@bunnings.com.au',
      'BGL-001',
      '6240/90155292',
      '2025-08-09',
      '2025-09-09',
      'submitted'::bill_status,
      206.80,
      19.68,
      226.48,
      '[{"name": "receipt.pdf", "url": "/uploads/receipt1.pdf"}]'::jsonb,
      false,
      auth.uid()
    ),
    (
      (SELECT id FROM public.projects LIMIT 1),
      'MS Gardening & Handyman Services',
      'billing@msgardening.com.au', 
      'MSGH-004',
      '2425070',
      '2025-07-26',
      '2025-08-26',
      'submitted'::bill_status,
      600.00,
      60.00,
      660.00,
      '[{"name": "invoice.pdf", "url": "/uploads/invoice2.pdf"}]'::jsonb,
      true,
      auth.uid()
    ),
    (
      (SELECT id FROM public.projects LIMIT 1),
      'Liston Newton Advisory Pty Ltd',
      'finance@listonnewton.com.au',
      'LNA-1969',
      'I031968',
      '2025-05-30',
      '2025-06-13',
      'submitted'::bill_status,
      1500.00,
      150.00,
      1650.00,
      '[{"name": "advisory_bill.pdf", "url": "/uploads/advisory.pdf"}]'::jsonb,
      true,
      auth.uid()
    );
  END IF;
END $$;