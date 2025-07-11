-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  abn TEXT,
  slogan TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create company_members table for user-company relationships
CREATE TABLE public.company_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- member, admin, owner
  status TEXT NOT NULL DEFAULT 'active', -- active, invited, inactive
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- Add company_id to existing tables that need to be company-scoped
ALTER TABLE public.projects ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.leads ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.estimates ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.digital_objects ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.time_entries ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.wbs_items ADD COLUMN company_id UUID REFERENCES public.companies(id);

-- Enable RLS on new tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies table
CREATE POLICY "Users can view companies they are members of" 
ON public.companies 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE company_id = companies.id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

CREATE POLICY "Company admins can update companies" 
ON public.companies 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE company_id = companies.id 
    AND user_id = auth.uid() 
    AND role IN ('admin', 'owner')
    AND status = 'active'
  )
);

CREATE POLICY "Authenticated users can create companies" 
ON public.companies 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policies for company_members table
CREATE POLICY "Users can view members of their companies" 
ON public.company_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.company_members cm 
    WHERE cm.company_id = company_members.company_id 
    AND cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Company admins can manage members" 
ON public.company_members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE company_id = company_members.company_id 
    AND user_id = auth.uid() 
    AND role IN ('admin', 'owner')
    AND status = 'active'
  )
);

-- Update existing RLS policies to be company-scoped
DROP POLICY IF EXISTS "Authenticated users can manage projects" ON public.projects;
CREATE POLICY "Users can manage projects in their companies" 
ON public.projects 
FOR ALL 
USING (
  company_id IS NULL OR -- Allow access to existing projects without company_id
  EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE company_id = projects.company_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

DROP POLICY IF EXISTS "Authenticated users can manage leads" ON public.leads;
CREATE POLICY "Users can manage leads in their companies" 
ON public.leads 
FOR ALL 
USING (
  company_id IS NULL OR -- Allow access to existing leads without company_id
  EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE company_id = leads.company_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_members_updated_at
BEFORE UPDATE ON public.company_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get user's companies
CREATE OR REPLACE FUNCTION public.get_user_companies(target_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  logo_url TEXT,
  role TEXT,
  status TEXT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.logo_url,
    cm.role,
    cm.status
  FROM public.companies c
  JOIN public.company_members cm ON c.id = cm.company_id
  WHERE cm.user_id = target_user_id
  AND cm.status = 'active'
  ORDER BY c.name;
$$;

-- Create function to handle new user company assignment
CREATE OR REPLACE FUNCTION public.handle_new_user_company()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  default_company_id UUID;
BEGIN
  -- For now, we'll create a personal company for each user
  -- In production, you might want different logic
  INSERT INTO public.companies (name, slug, created_by)
  VALUES (
    COALESCE(NEW.raw_user_meta_data ->> 'company', NEW.email || '''s Company'),
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data ->> 'company', NEW.email), ' ', '-')) || '-' || EXTRACT(EPOCH FROM now())::TEXT,
    NEW.id
  ) RETURNING id INTO default_company_id;
  
  -- Add user as owner of their company
  INSERT INTO public.company_members (company_id, user_id, role, status)
  VALUES (default_company_id, NEW.id, 'owner', 'active');
  
  RETURN NEW;
END;
$$;

-- Create trigger to assign company to new users
CREATE TRIGGER on_auth_user_created_assign_company
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_company();