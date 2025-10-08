-- COMPREHENSIVE FIX: Remove all digital_objects and digital-twin references

-- Step 1: Delete all digital-objects and digital-twin module records from company_modules
DELETE FROM public.company_modules 
WHERE module_name IN ('digital-objects', 'digital-twin', 'digital_objects', 'digitaltwin');

-- Step 2: Update the initialize_company_modules function to remove deprecated modules
CREATE OR REPLACE FUNCTION public.initialize_company_modules(target_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  module_name_val text;
  module_names text[] := ARRAY[
    'projects',
    'finance', 
    'sales',
    'dashboard',
    'cost-contracts',
    'tasks',
    'files',
    'team',
    'marketing',
    'risk',
    'ai-operations'
  ];
BEGIN
  FOREACH module_name_val IN ARRAY module_names
  LOOP
    INSERT INTO public.company_modules (company_id, module_name, enabled)
    VALUES (target_company_id, module_name_val, false)
    ON CONFLICT (company_id, module_name) DO NOTHING;
  END LOOP;
END;
$$;

-- Step 3: Add a check constraint to prevent digital-objects from being added in the future
ALTER TABLE public.company_modules 
DROP CONSTRAINT IF EXISTS valid_module_names;

ALTER TABLE public.company_modules
ADD CONSTRAINT valid_module_names 
CHECK (module_name NOT IN ('digital-objects', 'digital-twin', 'digital_objects', 'digitaltwin'));

COMMENT ON CONSTRAINT valid_module_names ON public.company_modules IS 'Prevents deprecated digital-objects and digital-twin modules from being added';
