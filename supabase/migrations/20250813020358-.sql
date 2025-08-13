-- Create file storage table for PDFs and receipts
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  path TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('invoice_pdf', 'receipt', 'bill_pdf', 'other')),
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  number TEXT NOT NULL UNIQUE,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'part_paid', 'paid', 'overdue', 'void')),
  client_name TEXT NOT NULL,
  client_email TEXT,
  notes TEXT,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  paid_to_date NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice items table
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  wbs_code TEXT,
  description TEXT NOT NULL,
  qty NUMERIC NOT NULL DEFAULT 1,
  rate NUMERIC NOT NULL DEFAULT 0,
  amount NUMERIC GENERATED ALWAYS AS (qty * rate) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice payments table  
CREATE TABLE public.invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  paid_on DATE NOT NULL,
  method TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  receipt_file_id UUID REFERENCES files(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bills table
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  supplier_name TEXT NOT NULL,
  supplier_email TEXT,
  bill_no TEXT NOT NULL,
  bill_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'scheduled', 'paid', 'void')),
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  paid_to_date NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bill items table
CREATE TABLE public.bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  wbs_code TEXT,
  description TEXT NOT NULL,
  qty NUMERIC NOT NULL DEFAULT 1,
  rate NUMERIC NOT NULL DEFAULT 0,
  amount NUMERIC GENERATED ALWAYS AS (qty * rate) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bill approvals table
CREATE TABLE public.bill_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  approver UUID NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  decided_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  comment TEXT
);

-- Create bill payments table
CREATE TABLE public.bill_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  paid_on DATE NOT NULL,
  method TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  receipt_file_id UUID REFERENCES files(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create finance snapshots table for analytics
CREATE TABLE public.finance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  as_of DATE NOT NULL,
  budget NUMERIC NOT NULL DEFAULT 0,
  committed NUMERIC NOT NULL DEFAULT 0,
  inv_total NUMERIC NOT NULL DEFAULT 0,
  inv_paid NUMERIC NOT NULL DEFAULT 0,
  bills_total NUMERIC NOT NULL DEFAULT 0,
  bills_paid NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, as_of)
);

-- Create events table for audit and notifications
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  name TEXT NOT NULL,
  ref_table TEXT,
  ref_id UUID,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sequence for invoice numbering
CREATE SEQUENCE invoice_number_seq;

-- Enable RLS on all tables
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for files
CREATE POLICY "Users can manage files in their projects" ON public.files
FOR ALL USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- RLS Policies for invoices
CREATE POLICY "Users can manage invoices in their projects" ON public.invoices
FOR ALL USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- RLS Policies for invoice_items
CREATE POLICY "Users can manage invoice items" ON public.invoice_items
FOR ALL USING (
  invoice_id IN (
    SELECT i.id FROM invoices i
    JOIN projects p ON i.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- RLS Policies for invoice_payments
CREATE POLICY "Users can manage invoice payments" ON public.invoice_payments
FOR ALL USING (
  invoice_id IN (
    SELECT i.id FROM invoices i
    JOIN projects p ON i.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- RLS Policies for bills
CREATE POLICY "Users can manage bills in their projects" ON public.bills
FOR ALL USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- RLS Policies for bill_items
CREATE POLICY "Users can manage bill items" ON public.bill_items
FOR ALL USING (
  bill_id IN (
    SELECT b.id FROM bills b
    JOIN projects p ON b.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- RLS Policies for bill_approvals
CREATE POLICY "Users can manage bill approvals" ON public.bill_approvals
FOR ALL USING (
  bill_id IN (
    SELECT b.id FROM bills b
    JOIN projects p ON b.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- RLS Policies for bill_payments
CREATE POLICY "Users can manage bill payments" ON public.bill_payments
FOR ALL USING (
  bill_id IN (
    SELECT b.id FROM bills b
    JOIN projects p ON b.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- RLS Policies for finance_snapshots
CREATE POLICY "Users can view finance snapshots from their projects" ON public.finance_snapshots
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- RLS Policies for events
CREATE POLICY "Users can view events from their projects" ON public.events
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- Triggers for updated_at timestamps
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bills_updated_at
  BEFORE UPDATE ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate invoice totals
CREATE OR REPLACE FUNCTION public.calculate_invoice_total()
RETURNS TRIGGER AS $$
BEGIN
  -- Update invoice totals when items change
  UPDATE invoices 
  SET 
    subtotal = (SELECT COALESCE(SUM(amount), 0) FROM invoice_items WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)),
    total = subtotal + tax,
    updated_at = now()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate bill totals
CREATE OR REPLACE FUNCTION public.calculate_bill_total()
RETURNS TRIGGER AS $$
BEGIN
  -- Update bill totals when items change
  UPDATE bills 
  SET 
    subtotal = (SELECT COALESCE(SUM(amount), 0) FROM bill_items WHERE bill_id = COALESCE(NEW.bill_id, OLD.bill_id)),
    total = subtotal + tax,
    updated_at = now()
  WHERE id = COALESCE(NEW.bill_id, OLD.bill_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for invoice item changes
CREATE TRIGGER calculate_invoice_total_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_invoice_total();

-- Trigger for bill item changes
CREATE TRIGGER calculate_bill_total_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.bill_items
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_bill_total();

-- Function to update invoice payment status
CREATE OR REPLACE FUNCTION public.update_invoice_payment_status()
RETURNS TRIGGER AS $$
DECLARE
  invoice_total NUMERIC;
  total_paid NUMERIC;
BEGIN
  -- Get invoice total and calculate total paid
  SELECT total INTO invoice_total FROM invoices WHERE id = NEW.invoice_id;
  SELECT COALESCE(SUM(amount), 0) INTO total_paid FROM invoice_payments WHERE invoice_id = NEW.invoice_id;
  
  -- Update invoice paid_to_date and status
  UPDATE invoices 
  SET 
    paid_to_date = total_paid,
    status = CASE 
      WHEN total_paid = 0 THEN 'sent'
      WHEN total_paid >= invoice_total THEN 'paid'
      ELSE 'part_paid'
    END,
    updated_at = now()
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update bill payment status
CREATE OR REPLACE FUNCTION public.update_bill_payment_status()
RETURNS TRIGGER AS $$
DECLARE
  bill_total NUMERIC;
  total_paid NUMERIC;
BEGIN
  -- Get bill total and calculate total paid
  SELECT total INTO bill_total FROM bills WHERE id = NEW.bill_id;
  SELECT COALESCE(SUM(amount), 0) INTO total_paid FROM bill_payments WHERE bill_id = NEW.bill_id;
  
  -- Update bill paid_to_date and status
  UPDATE bills 
  SET 
    paid_to_date = total_paid,
    status = CASE 
      WHEN total_paid >= bill_total THEN 'paid'
      ELSE status
    END,
    updated_at = now()
  WHERE id = NEW.bill_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for payment status updates
CREATE TRIGGER update_invoice_payment_status_trigger
  AFTER INSERT ON public.invoice_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invoice_payment_status();

CREATE TRIGGER update_bill_payment_status_trigger
  AFTER INSERT ON public.bill_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_bill_payment_status();

-- Helper function to generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Helper RPC to create invoice with items
CREATE OR REPLACE FUNCTION public.create_invoice(
  p_project_id UUID,
  p_client_name TEXT,
  p_client_email TEXT DEFAULT NULL,
  p_due_date DATE DEFAULT NULL,
  p_items JSONB DEFAULT '[]'
)
RETURNS UUID AS $$
DECLARE
  invoice_id UUID;
  invoice_number TEXT;
  item JSONB;
BEGIN
  -- Generate invoice number
  SELECT generate_invoice_number() INTO invoice_number;
  
  -- Create invoice
  INSERT INTO invoices (project_id, number, client_name, client_email, due_date)
  VALUES (p_project_id, invoice_number, p_client_name, p_client_email, COALESCE(p_due_date, CURRENT_DATE + 30))
  RETURNING id INTO invoice_id;
  
  -- Add items
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO invoice_items (invoice_id, description, qty, rate, wbs_code)
    VALUES (
      invoice_id,
      item->>'description',
      (item->>'qty')::NUMERIC,
      (item->>'rate')::NUMERIC,
      item->>'wbs_code'
    );
  END LOOP;
  
  RETURN invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;