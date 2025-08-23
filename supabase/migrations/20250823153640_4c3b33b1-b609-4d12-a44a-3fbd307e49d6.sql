-- Create stakeholder categories enum
CREATE TYPE stakeholder_category AS ENUM ('client', 'trade', 'subcontractor', 'supplier', 'consultant');

-- Create stakeholder status enum  
CREATE TYPE stakeholder_status AS ENUM ('active', 'inactive', 'pending');

-- Create compliance status enum
CREATE TYPE compliance_status AS ENUM ('valid', 'expired', 'expiring');

-- Create main stakeholders table
CREATE TABLE public.stakeholders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  category stakeholder_category NOT NULL,
  trade_industry TEXT,
  primary_contact_name TEXT,
  primary_email TEXT,
  primary_phone TEXT,
  abn TEXT,
  status stakeholder_status NOT NULL DEFAULT 'active',
  compliance_status compliance_status DEFAULT 'valid',
  compliance_expiry_date DATE,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create stakeholder contacts table
CREATE TABLE public.stakeholder_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stakeholder_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  is_preferred BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stakeholder addresses table
CREATE TABLE public.stakeholder_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stakeholder_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'head_office', 'site_office', 'postal', 'billing'
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'Australia',
  is_primary BOOLEAN DEFAULT false,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stakeholder documents table
CREATE TABLE public.stakeholder_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stakeholder_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL, -- 'insurance', 'license', 'certificate', 'other'
  file_url TEXT,
  expiry_date DATE,
  status compliance_status DEFAULT 'valid',
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stakeholder activities table
CREATE TABLE public.stakeholder_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stakeholder_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'note', 'call', 'email', 'meeting'
  title TEXT NOT NULL,
  description TEXT,
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stakeholder project roles table
CREATE TABLE public.stakeholder_project_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stakeholder_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'client', 'contractor', 'subcontractor', 'supplier', 'consultant'
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(stakeholder_id, project_id, role)
);

-- Enable RLS
ALTER TABLE public.stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakeholder_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakeholder_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakeholder_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakeholder_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakeholder_project_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for stakeholders
CREATE POLICY "Company members can manage stakeholders"
  ON public.stakeholders FOR ALL
  USING (company_id IN (
    SELECT cm.company_id FROM company_members cm 
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  ));

-- Create RLS policies for stakeholder_contacts
CREATE POLICY "Company members can manage stakeholder contacts"
  ON public.stakeholder_contacts FOR ALL
  USING (stakeholder_id IN (
    SELECT s.id FROM stakeholders s
    JOIN company_members cm ON s.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  ));

-- Create RLS policies for stakeholder_addresses
CREATE POLICY "Company members can manage stakeholder addresses"
  ON public.stakeholder_addresses FOR ALL
  USING (stakeholder_id IN (
    SELECT s.id FROM stakeholders s
    JOIN company_members cm ON s.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  ));

-- Create RLS policies for stakeholder_documents
CREATE POLICY "Company members can manage stakeholder documents"
  ON public.stakeholder_documents FOR ALL
  USING (stakeholder_id IN (
    SELECT s.id FROM stakeholders s
    JOIN company_members cm ON s.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  ));

-- Create RLS policies for stakeholder_activities
CREATE POLICY "Company members can manage stakeholder activities"
  ON public.stakeholder_activities FOR ALL
  USING (stakeholder_id IN (
    SELECT s.id FROM stakeholders s
    JOIN company_members cm ON s.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  ));

-- Create RLS policies for stakeholder_project_roles
CREATE POLICY "Company members can manage stakeholder project roles"
  ON public.stakeholder_project_roles FOR ALL
  USING (project_id IN (
    SELECT p.id FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  ));

-- Create indexes for better performance
CREATE INDEX idx_stakeholders_company_id ON public.stakeholders(company_id);
CREATE INDEX idx_stakeholders_category ON public.stakeholders(category);
CREATE INDEX idx_stakeholders_status ON public.stakeholders(status);
CREATE INDEX idx_stakeholder_contacts_stakeholder_id ON public.stakeholder_contacts(stakeholder_id);
CREATE INDEX idx_stakeholder_addresses_stakeholder_id ON public.stakeholder_addresses(stakeholder_id);
CREATE INDEX idx_stakeholder_documents_stakeholder_id ON public.stakeholder_documents(stakeholder_id);
CREATE INDEX idx_stakeholder_activities_stakeholder_id ON public.stakeholder_activities(stakeholder_id);
CREATE INDEX idx_stakeholder_project_roles_stakeholder_id ON public.stakeholder_project_roles(stakeholder_id);
CREATE INDEX idx_stakeholder_project_roles_project_id ON public.stakeholder_project_roles(project_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_stakeholders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stakeholders_updated_at
  BEFORE UPDATE ON public.stakeholders
  FOR EACH ROW
  EXECUTE FUNCTION update_stakeholders_updated_at();

-- Create function to update compliance status based on expiry dates
CREATE OR REPLACE FUNCTION update_stakeholder_compliance_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update stakeholder compliance status based on document expiry dates
  UPDATE public.stakeholders 
  SET compliance_status = CASE
    WHEN EXISTS (
      SELECT 1 FROM stakeholder_documents sd 
      WHERE sd.stakeholder_id = COALESCE(NEW.stakeholder_id, OLD.stakeholder_id)
      AND sd.expiry_date < CURRENT_DATE
    ) THEN 'expired'::compliance_status
    WHEN EXISTS (
      SELECT 1 FROM stakeholder_documents sd 
      WHERE sd.stakeholder_id = COALESCE(NEW.stakeholder_id, OLD.stakeholder_id)
      AND sd.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
      AND sd.expiry_date >= CURRENT_DATE
    ) THEN 'expiring'::compliance_status
    ELSE 'valid'::compliance_status
  END,
  compliance_expiry_date = (
    SELECT MIN(sd.expiry_date)
    FROM stakeholder_documents sd 
    WHERE sd.stakeholder_id = COALESCE(NEW.stakeholder_id, OLD.stakeholder_id)
    AND sd.expiry_date >= CURRENT_DATE
  )
  WHERE id = COALESCE(NEW.stakeholder_id, OLD.stakeholder_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_compliance_status_on_document_change
  AFTER INSERT OR UPDATE OR DELETE ON public.stakeholder_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_stakeholder_compliance_status();