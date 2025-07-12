-- Create company_modules table to store module settings for each company
CREATE TABLE public.company_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, module_name)
);

-- Enable Row Level Security
ALTER TABLE public.company_modules ENABLE ROW LEVEL SECURITY;

-- Create policies for company modules
CREATE POLICY "Platform admins can manage all company modules" 
ON public.company_modules 
FOR ALL 
USING (has_role(auth.uid(), 'superadmin'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Company owners can view their company modules" 
ON public.company_modules 
FOR SELECT 
USING (is_company_admin_or_owner(company_id, auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_company_modules_updated_at
BEFORE UPDATE ON public.company_modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();