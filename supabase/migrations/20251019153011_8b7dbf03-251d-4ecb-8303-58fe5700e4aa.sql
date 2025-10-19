-- Drop tables if they exist
DROP TABLE IF EXISTS public.bill_line_items CASCADE;
DROP TABLE IF EXISTS public.bills CASCADE;

-- Drop function if it exists
DROP FUNCTION IF EXISTS public.update_bills_updated_at() CASCADE;

-- Create bills table for storing expense bills
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Bill details
  supplier_name TEXT NOT NULL,
  supplier_email TEXT,
  bill_no TEXT NOT NULL,
  bill_date DATE NOT NULL,
  due_date DATE NOT NULL,
  reference_number TEXT,
  notes TEXT,
  
  -- Amounts
  subtotal NUMERIC(15,2) DEFAULT 0,
  tax NUMERIC(15,2) DEFAULT 0,
  total NUMERIC(15,2) NOT NULL,
  
  -- Bill status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  
  -- File reference
  file_url TEXT,
  storage_path TEXT,
  
  -- AI extraction metadata
  ai_confidence NUMERIC(3,2),
  ai_summary TEXT
);

-- Create bill line items table
CREATE TABLE public.bill_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES public.bills(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  qty NUMERIC(15,2) DEFAULT 1,
  rate NUMERIC(15,2) DEFAULT 0,
  amount NUMERIC(15,2) NOT NULL,
  tax_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_bills_company_id ON public.bills(company_id);
CREATE INDEX idx_bills_project_id ON public.bills(project_id);
CREATE INDEX idx_bills_created_by ON public.bills(created_by);
CREATE INDEX idx_bills_bill_date ON public.bills(bill_date);
CREATE INDEX idx_bills_due_date ON public.bills(due_date);
CREATE INDEX idx_bill_line_items_bill_id ON public.bill_line_items(bill_id);

-- Create trigger function
CREATE FUNCTION public.update_bills_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_bills_updated_at
  BEFORE UPDATE ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_bills_updated_at();

-- Enable RLS
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_line_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bills
CREATE POLICY "Users can manage bills in their companies"
  ON public.bills FOR ALL
  USING (
    company_id IN (
      SELECT cm.company_id 
      FROM public.company_members cm 
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT cm.company_id 
      FROM public.company_members cm 
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  );

-- RLS Policies for bill_line_items
CREATE POLICY "Users can manage bill line items"
  ON public.bill_line_items FOR ALL
  USING (
    bill_id IN (
      SELECT b.id 
      FROM public.bills b
      JOIN public.company_members cm ON b.company_id = cm.company_id
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  )
  WITH CHECK (
    bill_id IN (
      SELECT b.id 
      FROM public.bills b
      JOIN public.company_members cm ON b.company_id = cm.company_id
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  );