-- Insert the correct Company Modules
INSERT INTO public.company_modules (company_id, module_name, enabled) 
SELECT DISTINCT c.id, 'projects', true 
FROM public.companies c
WHERE NOT EXISTS (
  SELECT 1 FROM public.company_modules cm 
  WHERE cm.company_id = c.id AND cm.module_name = 'projects'
);

INSERT INTO public.company_modules (company_id, module_name, enabled) 
SELECT DISTINCT c.id, 'finance', true 
FROM public.companies c
WHERE NOT EXISTS (
  SELECT 1 FROM public.company_modules cm 
  WHERE cm.company_id = c.id AND cm.module_name = 'finance'
);

INSERT INTO public.company_modules (company_id, module_name, enabled) 
SELECT DISTINCT c.id, 'sales', true 
FROM public.companies c
WHERE NOT EXISTS (
  SELECT 1 FROM public.company_modules cm 
  WHERE cm.company_id = c.id AND cm.module_name = 'sales'
);