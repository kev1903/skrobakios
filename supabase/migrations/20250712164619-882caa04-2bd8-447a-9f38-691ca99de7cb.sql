-- Create a function to initialize default company modules
CREATE OR REPLACE FUNCTION public.initialize_company_modules(target_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  module_name_val text;
  module_names text[] := ARRAY[
    'projects',
    'finance', 
    'sales',
    'dashboard',
    'digital-twin',
    'cost-contracts',
    'schedule',
    'tasks',
    'files',
    'team',
    'digital-objects'
  ];
BEGIN
  -- Insert all available modules as disabled by default for the company
  FOREACH module_name_val IN ARRAY module_names
  LOOP
    INSERT INTO public.company_modules (company_id, module_name, enabled)
    VALUES (target_company_id, module_name_val, false)
    ON CONFLICT (company_id, module_name) DO NOTHING;
  END LOOP;
END;
$$;

-- Create a trigger to automatically initialize modules for new companies
CREATE OR REPLACE FUNCTION public.handle_new_company_modules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Initialize all modules as disabled for the new company
  PERFORM public.initialize_company_modules(NEW.id);
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_initialize_company_modules ON public.companies;
CREATE TRIGGER trigger_initialize_company_modules
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_company_modules();

-- Update the company_modules table to ensure proper constraints
ALTER TABLE public.company_modules 
ADD CONSTRAINT unique_company_module 
UNIQUE (company_id, module_name);