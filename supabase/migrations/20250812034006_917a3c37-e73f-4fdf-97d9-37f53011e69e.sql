-- Finance Module Database Schema (Fixed Enum Casting)
-- Create enums for file kinds and statuses
CREATE TYPE file_kind AS ENUM ('invoice_pdf', 'receipt', 'bill_pdf', 'other');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'part_paid', 'paid', 'overdue', 'void');
CREATE TYPE bill_status AS ENUM ('draft', 'submitted', 'approved', 'scheduled', 'paid', 'void');
CREATE TYPE approval_decision AS ENUM ('approved', 'rejected');
CREATE TYPE payment_method AS ENUM ('bank_transfer', 'check', 'cash', 'card', 'other');

-- Files table for document management
CREATE TABLE public.files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  path TEXT NOT NULL,
  kind file_kind NOT NULL DEFAULT 'other',
  meta JSONB DEFAULT '{}',
  file_size BIGINT,
  content_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  number TEXT NOT NULL UNIQUE,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status invoice_status NOT NULL DEFAULT 'draft',
  client_name TEXT NOT NULL,
  client_email TEXT,
  notes TEXT,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_to_date NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Invoice items table
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL,
  wbs_code TEXT,
  description TEXT NOT NULL,
  qty NUMERIC(10,2) NOT NULL DEFAULT 1,
  rate NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Invoice payments table
CREATE TABLE public.invoice_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL,
  paid_on DATE NOT NULL,
  method payment_method NOT NULL DEFAULT 'bank_transfer',
  amount NUMERIC(12,2) NOT NULL,
  receipt_file_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Bills table
CREATE TABLE public.bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  supplier_name TEXT NOT NULL,
  supplier_email TEXT,
  bill_no TEXT NOT NULL,
  bill_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status bill_status NOT NULL DEFAULT 'draft',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_to_date NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Bill items table
CREATE TABLE public.bill_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID NOT NULL,
  wbs_code TEXT,
  description TEXT NOT NULL,
  qty NUMERIC(10,2) NOT NULL DEFAULT 1,
  rate NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bill approvals table
CREATE TABLE public.bill_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID NOT NULL,
  approver UUID NOT NULL,
  decision approval_decision NOT NULL,
  decided_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  comment TEXT
);

-- Bill payments table
CREATE TABLE public.bill_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID NOT NULL,
  paid_on DATE NOT NULL,
  method payment_method NOT NULL DEFAULT 'bank_transfer',
  amount NUMERIC(12,2) NOT NULL,
  receipt_file_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Finance snapshots for analytics
CREATE TABLE public.finance_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  as_of DATE NOT NULL DEFAULT CURRENT_DATE,
  budget NUMERIC(12,2) DEFAULT 0,
  committed NUMERIC(12,2) DEFAULT 0,
  inv_total NUMERIC(12,2) DEFAULT 0,
  inv_paid NUMERIC(12,2) DEFAULT 0,
  bills_total NUMERIC(12,2) DEFAULT 0,
  bills_paid NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, as_of)
);

-- Events table for audit trail
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  name TEXT NOT NULL,
  ref_table TEXT,
  ref_id UUID,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Add foreign key constraints
ALTER TABLE public.files ADD CONSTRAINT files_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.invoice_items ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;
ALTER TABLE public.invoice_payments ADD CONSTRAINT invoice_payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;
ALTER TABLE public.invoice_payments ADD CONSTRAINT invoice_payments_receipt_file_id_fkey FOREIGN KEY (receipt_file_id) REFERENCES public.files(id);
ALTER TABLE public.bills ADD CONSTRAINT bills_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.bill_items ADD CONSTRAINT bill_items_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES public.bills(id) ON DELETE CASCADE;
ALTER TABLE public.bill_approvals ADD CONSTRAINT bill_approvals_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES public.bills(id) ON DELETE CASCADE;
ALTER TABLE public.bill_payments ADD CONSTRAINT bill_payments_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES public.bills(id) ON DELETE CASCADE;
ALTER TABLE public.bill_payments ADD CONSTRAINT bill_payments_receipt_file_id_fkey FOREIGN KEY (receipt_file_id) REFERENCES public.files(id);
ALTER TABLE public.finance_snapshots ADD CONSTRAINT finance_snapshots_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.events ADD CONSTRAINT events_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

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

-- RLS Policies for project-based access
-- Files policies
CREATE POLICY "Users can manage files in their projects" ON public.files
FOR ALL USING (project_id IN (
  SELECT p.id FROM projects p
  JOIN company_members cm ON p.company_id = cm.company_id
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

-- Invoices policies
CREATE POLICY "Users can manage invoices in their projects" ON public.invoices
FOR ALL USING (project_id IN (
  SELECT p.id FROM projects p
  JOIN company_members cm ON p.company_id = cm.company_id
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

-- Invoice items policies
CREATE POLICY "Users can manage invoice items" ON public.invoice_items
FOR ALL USING (invoice_id IN (
  SELECT i.id FROM invoices i
  JOIN projects p ON i.project_id = p.id
  JOIN company_members cm ON p.company_id = cm.company_id
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

-- Invoice payments policies
CREATE POLICY "Users can manage invoice payments" ON public.invoice_payments
FOR ALL USING (invoice_id IN (
  SELECT i.id FROM invoices i
  JOIN projects p ON i.project_id = p.id
  JOIN company_members cm ON p.company_id = cm.company_id
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

-- Bills policies
CREATE POLICY "Users can manage bills in their projects" ON public.bills
FOR ALL USING (project_id IN (
  SELECT p.id FROM projects p
  JOIN company_members cm ON p.company_id = cm.company_id
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

-- Bill items policies
CREATE POLICY "Users can manage bill items" ON public.bill_items
FOR ALL USING (bill_id IN (
  SELECT b.id FROM bills b
  JOIN projects p ON b.project_id = p.id
  JOIN company_members cm ON p.company_id = cm.company_id
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

-- Bill approvals policies
CREATE POLICY "Users can manage bill approvals" ON public.bill_approvals
FOR ALL USING (bill_id IN (
  SELECT b.id FROM bills b
  JOIN projects p ON b.project_id = p.id
  JOIN company_members cm ON p.company_id = cm.company_id
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

-- Bill payments policies
CREATE POLICY "Users can manage bill payments" ON public.bill_payments
FOR ALL USING (bill_id IN (
  SELECT b.id FROM bills b
  JOIN projects p ON b.project_id = p.id
  JOIN company_members cm ON p.company_id = cm.company_id
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

-- Finance snapshots policies
CREATE POLICY "Users can view finance snapshots" ON public.finance_snapshots
FOR ALL USING (project_id IN (
  SELECT p.id FROM projects p
  JOIN company_members cm ON p.company_id = cm.company_id
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

-- Events policies
CREATE POLICY "Users can manage events in their projects" ON public.events
FOR ALL USING (project_id IN (
  SELECT p.id FROM projects p
  JOIN company_members cm ON p.company_id = cm.company_id
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

-- Functions for calculations and triggers
-- Function to calculate invoice total
CREATE OR REPLACE FUNCTION calculate_invoice_total()
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

-- Function to calculate bill total
CREATE OR REPLACE FUNCTION calculate_bill_total()
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

-- Function to update invoice payment status (with proper enum casting)
CREATE OR REPLACE FUNCTION update_invoice_payment_status()
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
      WHEN total_paid = 0 THEN 'sent'::invoice_status
      WHEN total_paid >= invoice_total THEN 'paid'::invoice_status
      ELSE 'part_paid'::invoice_status
    END,
    updated_at = now()
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update bill payment status (with proper enum casting)
CREATE OR REPLACE FUNCTION update_bill_payment_status()
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
      WHEN total_paid >= bill_total THEN 'paid'::bill_status
      ELSE status
    END,
    updated_at = now()
  WHERE id = NEW.bill_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate item amounts
CREATE OR REPLACE FUNCTION calculate_item_amount()
RETURNS TRIGGER AS $$
BEGIN
  NEW.amount = NEW.qty * NEW.rate;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER invoice_items_amount_trigger
  BEFORE INSERT OR UPDATE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION calculate_item_amount();

CREATE TRIGGER bill_items_amount_trigger
  BEFORE INSERT OR UPDATE ON bill_items
  FOR EACH ROW EXECUTE FUNCTION calculate_item_amount();

CREATE TRIGGER invoice_items_total_trigger
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION calculate_invoice_total();

CREATE TRIGGER bill_items_total_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bill_items
  FOR EACH ROW EXECUTE FUNCTION calculate_bill_total();

CREATE TRIGGER invoice_payment_status_trigger
  AFTER INSERT OR UPDATE ON invoice_payments
  FOR EACH ROW EXECUTE FUNCTION update_invoice_payment_status();

CREATE TRIGGER bill_payment_status_trigger
  AFTER INSERT OR UPDATE ON bill_payments
  FOR EACH ROW EXECUTE FUNCTION update_bill_payment_status();

-- Helper functions for invoice/bill operations
CREATE OR REPLACE FUNCTION create_invoice(
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
  SELECT 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 6, '0') INTO invoice_number;
  
  -- Create invoice
  INSERT INTO invoices (project_id, number, client_name, client_email, due_date, created_by)
  VALUES (p_project_id, invoice_number, p_client_name, p_client_email, COALESCE(p_due_date, CURRENT_DATE + 30), auth.uid())
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

-- Create sequences
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq;
CREATE SEQUENCE IF NOT EXISTS bill_number_seq;

-- Function to generate unique invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Insert some test data for development
INSERT INTO invoices (project_id, number, client_name, client_email, issue_date, due_date, status, subtotal, tax, total, created_by)
SELECT 
  p.id,
  generate_invoice_number(),
  'Test Client ' || (ROW_NUMBER() OVER()),
  'client' || (ROW_NUMBER() OVER()) || '@example.com',
  CURRENT_DATE - INTERVAL '15 days' * (ROW_NUMBER() OVER()),
  CURRENT_DATE - INTERVAL '15 days' * (ROW_NUMBER() OVER()) + INTERVAL '30 days',
  CASE ROW_NUMBER() OVER()
    WHEN 1 THEN 'overdue'::invoice_status
    WHEN 2 THEN 'part_paid'::invoice_status
    ELSE 'sent'::invoice_status
  END,
  5000.00,
  500.00,
  5500.00,
  auth.uid()
FROM projects p
LIMIT 3;

-- Insert test invoice items
INSERT INTO invoice_items (invoice_id, description, qty, rate, wbs_code)
SELECT 
  i.id,
  'Construction Services',
  1,
  5000.00,
  '4.1 EXCAVATION'
FROM invoices i;

-- Insert test payment for part_paid invoice
INSERT INTO invoice_payments (invoice_id, paid_on, amount, method, created_by)
SELECT 
  i.id,
  CURRENT_DATE - INTERVAL '5 days',
  2750.00,
  'bank_transfer'::payment_method,
  auth.uid()
FROM invoices i 
WHERE i.status = 'part_paid'
LIMIT 1;