-- Enable all modules for all businesses
-- First, ensure all companies have all available modules (in case some are missing)
-- Get all available modules from the initialize_company_modules function
INSERT INTO public.company_modules (company_id, module_name, enabled)
SELECT 
    c.id as company_id,
    modules.module_name,
    true as enabled
FROM 
    public.companies c
CROSS JOIN (
    VALUES 
        ('projects'),
        ('finance'), 
        ('sales'),
        ('dashboard'),
        ('digital-twin'),
        ('cost-contracts'),
        ('schedule'),
        ('tasks'),
        ('files'),
        ('team'),
        ('digital-objects')
) AS modules(module_name)
ON CONFLICT (company_id, module_name) 
DO UPDATE SET 
    enabled = true,
    updated_at = now();

-- Also update any existing disabled modules to be enabled
UPDATE public.company_modules 
SET 
    enabled = true,
    updated_at = now()
WHERE enabled = false;