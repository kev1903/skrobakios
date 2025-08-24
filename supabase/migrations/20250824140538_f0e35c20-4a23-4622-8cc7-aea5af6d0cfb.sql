-- Create procurement-related tables

-- RFQ table
CREATE TABLE IF NOT EXISTS public.rfqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  rfq_number TEXT NOT NULL,
  work_package TEXT NOT NULL,
  trade_category TEXT NOT NULL,
  scope_summary TEXT,
  due_date DATE,
  attachments JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'RFQ Draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  CONSTRAINT rfqs_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  trade_category TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  compliance_rating TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  quote_ref TEXT,
  quote_amount_ex_gst NUMERIC(15,2),
  gst NUMERIC(15,2),
  quote_amount_inc_gst NUMERIC(15,2),
  validity_date DATE,
  lead_time_days INTEGER,
  inclusions_exclusions TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'Invited',
  scope_coverage_percent NUMERIC(5,2),
  is_compliant BOOLEAN,
  evaluation_score NUMERIC(5,2),
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT quotes_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE,
  CONSTRAINT quotes_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- Approvals table
CREATE TABLE IF NOT EXISTS public.procurement_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL,
  recommended_quote_id UUID NOT NULL,
  justification_notes TEXT,
  approvers JSONB DEFAULT '[]'::jsonb,
  approval_status TEXT NOT NULL DEFAULT 'Pending',
  approved_value NUMERIC(15,2),
  approval_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT approvals_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE,
  CONSTRAINT approvals_quote_id_fkey FOREIGN KEY (recommended_quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);

-- Commitments table
CREATE TABLE IF NOT EXISTS public.commitments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  rfq_id UUID NOT NULL,
  quote_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  commitment_number TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'PO',
  value_ex_gst NUMERIC(15,2),
  gst NUMERIC(15,2),
  value_inc_gst NUMERIC(15,2),
  start_date DATE,
  end_date DATE,
  retention_percent NUMERIC(5,2),
  terms TEXT,
  commitment_status TEXT NOT NULL DEFAULT 'Draft',
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT commitments_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT commitments_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE,
  CONSTRAINT commitments_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
  CONSTRAINT commitments_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- Compliance Documents table
CREATE TABLE IF NOT EXISTS public.compliance_docs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL,
  commitment_id UUID,
  doc_type TEXT NOT NULL,
  reference_no TEXT,
  issue_date DATE,
  expiry_date DATE,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'Valid',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT compliance_docs_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  CONSTRAINT compliance_docs_commitment_id_fkey FOREIGN KEY (commitment_id) REFERENCES commitments(id) ON DELETE CASCADE
);

-- Create sequences for auto-numbering
CREATE SEQUENCE IF NOT EXISTS rfq_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS commitment_number_seq START 1;

-- Functions to generate numbers
CREATE OR REPLACE FUNCTION generate_rfq_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN 'RFQ-' || LPAD(NEXTVAL('rfq_number_seq')::TEXT, 4, '0');
END;
$$;

CREATE OR REPLACE FUNCTION generate_commitment_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN 'PO-' || LPAD(NEXTVAL('commitment_number_seq')::TEXT, 4, '0');
END;
$$;

-- Triggers for auto-numbering
CREATE OR REPLACE FUNCTION set_rfq_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.rfq_number IS NULL OR NEW.rfq_number = '' THEN
    NEW.rfq_number := generate_rfq_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION set_commitment_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.commitment_number IS NULL OR NEW.commitment_number = '' THEN
    NEW.commitment_number := generate_commitment_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS set_rfq_number_trigger ON public.rfqs;
CREATE TRIGGER set_rfq_number_trigger
  BEFORE INSERT ON public.rfqs
  FOR EACH ROW
  EXECUTE FUNCTION set_rfq_number();

DROP TRIGGER IF EXISTS set_commitment_number_trigger ON public.commitments;
CREATE TRIGGER set_commitment_number_trigger
  BEFORE INSERT ON public.commitments
  FOR EACH ROW
  EXECUTE FUNCTION set_commitment_number();

-- Update triggers for timestamps
CREATE OR REPLACE FUNCTION update_procurement_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create update triggers
DROP TRIGGER IF EXISTS update_rfqs_updated_at ON public.rfqs;
CREATE TRIGGER update_rfqs_updated_at
  BEFORE UPDATE ON public.rfqs
  FOR EACH ROW
  EXECUTE FUNCTION update_procurement_updated_at();

DROP TRIGGER IF EXISTS update_quotes_updated_at ON public.quotes;
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_procurement_updated_at();

DROP TRIGGER IF EXISTS update_vendors_updated_at ON public.vendors;
CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_procurement_updated_at();

DROP TRIGGER IF EXISTS update_approvals_updated_at ON public.procurement_approvals;
CREATE TRIGGER update_approvals_updated_at
  BEFORE UPDATE ON public.procurement_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_procurement_updated_at();

DROP TRIGGER IF EXISTS update_commitments_updated_at ON public.commitments;
CREATE TRIGGER update_commitments_updated_at
  BEFORE UPDATE ON public.commitments
  FOR EACH ROW
  EXECUTE FUNCTION update_procurement_updated_at();

DROP TRIGGER IF EXISTS update_compliance_docs_updated_at ON public.compliance_docs;
CREATE TRIGGER update_compliance_docs_updated_at
  BEFORE UPDATE ON public.compliance_docs
  FOR EACH ROW
  EXECUTE FUNCTION update_procurement_updated_at();

-- Function to calculate GST and total amounts
CREATE OR REPLACE FUNCTION calculate_quote_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.quote_amount_ex_gst IS NOT NULL THEN
    NEW.gst := NEW.quote_amount_ex_gst * 0.10; -- 10% GST
    NEW.quote_amount_inc_gst := NEW.quote_amount_ex_gst + NEW.gst;
  END IF;
  
  IF NEW.quote_amount_inc_gst IS NOT NULL AND NEW.quote_amount_ex_gst IS NULL THEN
    NEW.quote_amount_ex_gst := NEW.quote_amount_inc_gst / 1.10;
    NEW.gst := NEW.quote_amount_inc_gst - NEW.quote_amount_ex_gst;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION calculate_commitment_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.value_ex_gst IS NOT NULL THEN
    NEW.gst := NEW.value_ex_gst * 0.10; -- 10% GST
    NEW.value_inc_gst := NEW.value_ex_gst + NEW.gst;
  END IF;
  
  IF NEW.value_inc_gst IS NOT NULL AND NEW.value_ex_gst IS NULL THEN
    NEW.value_ex_gst := NEW.value_inc_gst / 1.10;
    NEW.gst := NEW.value_inc_gst - NEW.value_ex_gst;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create calculation triggers
DROP TRIGGER IF EXISTS calculate_quote_totals_trigger ON public.quotes;
CREATE TRIGGER calculate_quote_totals_trigger
  BEFORE INSERT OR UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION calculate_quote_totals();

DROP TRIGGER IF EXISTS calculate_commitment_totals_trigger ON public.commitments;
CREATE TRIGGER calculate_commitment_totals_trigger
  BEFORE INSERT OR UPDATE ON public.commitments
  FOR EACH ROW
  EXECUTE FUNCTION calculate_commitment_totals();

-- Enable RLS
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_docs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company members can manage RFQs" ON public.rfqs
  FOR ALL USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
  );

CREATE POLICY "Company members can manage vendors" ON public.vendors
  FOR ALL USING (
    company_id IN (
      SELECT cm.company_id FROM company_members cm
      WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
  );

CREATE POLICY "Company members can manage quotes" ON public.quotes
  FOR ALL USING (
    rfq_id IN (
      SELECT r.id FROM rfqs r
      JOIN projects p ON r.project_id = p.id
      JOIN company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
  );

CREATE POLICY "Company members can manage approvals" ON public.procurement_approvals
  FOR ALL USING (
    rfq_id IN (
      SELECT r.id FROM rfqs r
      JOIN projects p ON r.project_id = p.id
      JOIN company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
  );

CREATE POLICY "Company members can manage commitments" ON public.commitments
  FOR ALL USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
  );

CREATE POLICY "Company members can manage compliance docs" ON public.compliance_docs
  FOR ALL USING (
    vendor_id IN (
      SELECT v.id FROM vendors v
      JOIN company_members cm ON v.company_id = cm.company_id
      WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
  );