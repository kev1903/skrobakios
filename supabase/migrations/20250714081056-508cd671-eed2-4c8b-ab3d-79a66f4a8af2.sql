-- Phase 1: Database Restructuring for Self-Service Platform

-- Update user_roles enum to better reflect platform roles
-- Add 'service_provider' role for freelancers/contractors
DO $$ 
BEGIN
    -- Add new role to existing enum
    ALTER TYPE app_role ADD VALUE 'service_provider';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create business_types enum for different business categories
CREATE TYPE business_type AS ENUM (
  'individual',
  'small_business', 
  'enterprise',
  'agency',
  'freelancer'
);

-- Create service_categories table for platform services
CREATE TABLE public.service_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.service_categories(id),
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table for provider offerings
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL,
  category_id UUID REFERENCES public.service_categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  price_type TEXT DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'hourly', 'project', 'custom')),
  base_price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  duration_estimate INTEGER, -- in hours
  skills_required TEXT[],
  requirements TEXT,
  deliverables TEXT,
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_profiles table extending companies
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS business_type business_type DEFAULT 'small_business',
ADD COLUMN IF NOT EXISTS certification_status TEXT DEFAULT 'pending' CHECK (certification_status IN ('pending', 'verified', 'premium', 'suspended')),
ADD COLUMN IF NOT EXISTS service_areas TEXT[], -- geographical or service areas
ADD COLUMN IF NOT EXISTS portfolio_highlights TEXT[],
ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS contact_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'pro', 'enterprise'));

-- Create project_requests table for service requests
CREATE TABLE public.project_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL, -- user_id of the client
  service_category_id UUID REFERENCES public.service_categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  deadline DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('draft', 'open', 'in_progress', 'completed', 'cancelled')),
  required_skills TEXT[],
  attachments TEXT[],
  location_preference TEXT, -- 'remote', 'on_site', 'hybrid', or specific location
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create proposals table for service provider responses
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_request_id UUID REFERENCES public.project_requests(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL,
  service_id UUID REFERENCES public.services(id),
  proposed_price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  estimated_duration INTEGER, -- in hours
  delivery_date DATE,
  proposal_text TEXT NOT NULL,
  terms_and_conditions TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contracts table for accepted proposals
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_request_id UUID REFERENCES public.project_requests(id),
  proposal_id UUID REFERENCES public.proposals(id),
  client_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  contract_number TEXT UNIQUE NOT NULL,
  agreed_price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled', 'disputed')),
  terms TEXT NOT NULL,
  milestones JSONB DEFAULT '[]',
  payment_schedule JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invitations table for platform invitations
CREATE TABLE public.platform_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invited_by UUID NOT NULL,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'company_admin',
  invitation_type TEXT NOT NULL CHECK (invitation_type IN ('join_platform', 'join_company', 'collaborate')),
  company_id UUID REFERENCES public.companies(id),
  message TEXT,
  token TEXT UNIQUE NOT NULL DEFAULT generate_invitation_token(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_services_provider_id ON public.services(provider_id);
CREATE INDEX idx_services_category_id ON public.services(category_id);
CREATE INDEX idx_project_requests_client_id ON public.project_requests(client_id);
CREATE INDEX idx_project_requests_status ON public.project_requests(status);
CREATE INDEX idx_proposals_project_request_id ON public.proposals(project_request_id);
CREATE INDEX idx_proposals_provider_id ON public.proposals(provider_id);
CREATE INDEX idx_contracts_client_id ON public.contracts(client_id);
CREATE INDEX idx_contracts_provider_id ON public.contracts(provider_id);
CREATE INDEX idx_platform_invitations_email ON public.platform_invitations(email);
CREATE INDEX idx_platform_invitations_token ON public.platform_invitations(token);

-- Enable RLS on new tables
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_invitations ENABLE ROW LEVEL SECURITY;

-- Add RLS policies

-- Service Categories - readable by all authenticated users
CREATE POLICY "Service categories are viewable by authenticated users"
ON public.service_categories FOR SELECT
USING (auth.role() = 'authenticated');

-- Services - providers can manage their own, others can view active ones
CREATE POLICY "Service providers can manage their own services"
ON public.services FOR ALL
USING (provider_id = auth.uid())
WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Active services are viewable by authenticated users"
ON public.services FOR SELECT
USING (is_active = true AND auth.role() = 'authenticated');

-- Project Requests - clients can manage their own, providers can view open ones
CREATE POLICY "Clients can manage their own project requests"
ON public.project_requests FOR ALL
USING (client_id = auth.uid())
WITH CHECK (client_id = auth.uid());

CREATE POLICY "Open project requests are viewable by authenticated users"
ON public.project_requests FOR SELECT
USING (status = 'open' AND auth.role() = 'authenticated');

-- Proposals - providers can manage their own, clients can view proposals for their requests
CREATE POLICY "Providers can manage their own proposals"
ON public.proposals FOR ALL
USING (provider_id = auth.uid())
WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Clients can view proposals for their requests"
ON public.proposals FOR SELECT
USING (project_request_id IN (
  SELECT id FROM public.project_requests WHERE client_id = auth.uid()
));

-- Contracts - parties can view and update their contracts
CREATE POLICY "Contract parties can view and manage their contracts"
ON public.contracts FOR ALL
USING (client_id = auth.uid() OR provider_id = auth.uid())
WITH CHECK (client_id = auth.uid() OR provider_id = auth.uid());

-- Platform Invitations - users can view invitations sent to their email
CREATE POLICY "Users can view invitations sent to them"
ON public.platform_invitations FOR SELECT
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Authenticated users can create invitations"
ON public.platform_invitations FOR INSERT
WITH CHECK (invited_by = auth.uid());

CREATE POLICY "Invitors can update their invitations"
ON public.platform_invitations FOR UPDATE
USING (invited_by = auth.uid());

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_service_categories_updated_at
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_requests_updated_at
  BEFORE UPDATE ON public.project_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_invitations_updated_at
  BEFORE UPDATE ON public.platform_invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial service categories
INSERT INTO public.service_categories (name, description, icon, sort_order) VALUES
('Development', 'Software development and programming services', 'code', 1),
('Design', 'Graphic design, UI/UX, and creative services', 'palette', 2),
('Marketing', 'Digital marketing, SEO, and advertising services', 'megaphone', 3),
('Writing', 'Content writing, copywriting, and technical documentation', 'pen-tool', 4),
('Business', 'Business consulting, strategy, and operations', 'briefcase', 5),
('Data', 'Data analysis, data science, and research services', 'bar-chart', 6);

-- Insert development subcategories
INSERT INTO public.service_categories (name, description, parent_id, icon, sort_order) VALUES
('Web Development', 'Frontend and backend web development', (SELECT id FROM public.service_categories WHERE name = 'Development'), 'globe', 1),
('Mobile Development', 'iOS and Android app development', (SELECT id FROM public.service_categories WHERE name = 'Development'), 'smartphone', 2),
('Desktop Development', 'Desktop application development', (SELECT id FROM public.service_categories WHERE name = 'Development'), 'monitor', 3);

-- Insert design subcategories  
INSERT INTO public.service_categories (name, description, parent_id, icon, sort_order) VALUES
('UI/UX Design', 'User interface and user experience design', (SELECT id FROM public.service_categories WHERE name = 'Design'), 'layout', 1),
('Graphic Design', 'Logos, branding, and visual design', (SELECT id FROM public.service_categories WHERE name = 'Design'), 'image', 2),
('Web Design', 'Website design and prototyping', (SELECT id FROM public.service_categories WHERE name = 'Design'), 'layout', 3);

-- Generate contract numbers function
CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'CT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('contract_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for contract numbers
CREATE SEQUENCE contract_number_seq START 1000;

-- Add contract number generation trigger
CREATE OR REPLACE FUNCTION set_contract_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.contract_number IS NULL THEN
    NEW.contract_number := generate_contract_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_contract_number_trigger
  BEFORE INSERT ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION set_contract_number();