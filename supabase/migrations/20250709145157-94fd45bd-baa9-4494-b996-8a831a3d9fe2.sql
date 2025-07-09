-- Create estimates table for project estimation data
CREATE TABLE public.estimates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_number TEXT NOT NULL,
  estimate_name TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id),
  client_name TEXT,
  client_email TEXT,
  estimate_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  last_modified_by UUID
);

-- Create estimate line items table
CREATE TABLE public.estimate_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  item_description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  line_total DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_line_items ENABLE ROW LEVEL SECURITY;

-- Create policies for estimates
CREATE POLICY "Anyone can view estimates" ON public.estimates FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create estimates" ON public.estimates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update estimates they created" ON public.estimates FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete estimates they created" ON public.estimates FOR DELETE USING (auth.uid() = created_by);

-- Create policies for estimate line items
CREATE POLICY "Anyone can view estimate line items" ON public.estimate_line_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create line items" ON public.estimate_line_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update line items for estimates they created" ON public.estimate_line_items FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.estimates WHERE estimates.id = estimate_line_items.estimate_id AND estimates.created_by = auth.uid()));
CREATE POLICY "Users can delete line items for estimates they created" ON public.estimate_line_items FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.estimates WHERE estimates.id = estimate_line_items.estimate_id AND estimates.created_by = auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_estimates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_estimates_updated_at
  BEFORE UPDATE ON public.estimates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_estimates_updated_at();

CREATE TRIGGER update_estimate_line_items_updated_at
  BEFORE UPDATE ON public.estimate_line_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample estimate data
INSERT INTO public.estimates (estimate_number, estimate_name, client_name, client_email, estimate_date, expiry_date, status, subtotal, tax_amount, total_amount, notes) VALUES
('EST-2025-001', 'Office Building Renovation', 'ABC Construction Ltd', 'contact@abcconstruction.com', '2025-01-15', '2025-02-15', 'sent', 45000.00, 4500.00, 49500.00, 'Complete renovation of ground floor office space'),
('EST-2025-002', 'Residential Kitchen Remodel', 'Johnson Family', 'sarah.johnson@email.com', '2025-01-10', '2025-02-10', 'draft', 28000.00, 2800.00, 30800.00, 'Full kitchen renovation including appliances'),
('EST-2025-003', 'Warehouse Extension', 'Industrial Solutions Inc', 'projects@industrialsolutions.com', '2025-01-08', '2025-02-08', 'accepted', 120000.00, 12000.00, 132000.00, 'Additional 5000 sq ft warehouse space'),
('EST-2025-004', 'School Cafeteria Upgrade', 'Springfield School District', 'facilities@springfield.edu', '2025-01-05', '2025-02-05', 'sent', 75000.00, 7500.00, 82500.00, 'Modernization of cafeteria facilities'),
('EST-2025-005', 'Retail Store Fitout', 'Fashion Forward Retail', 'store@fashionforward.com', '2025-01-03', '2025-02-03', 'rejected', 35000.00, 3500.00, 38500.00, 'Complete store interior design and fitout');