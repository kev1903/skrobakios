-- Remove all schedule/timeline related database tables and data

-- First, drop the project network tables (schedule-related)
DROP TABLE IF EXISTS public.project_network_dependencies CASCADE;
DROP TABLE IF EXISTS public.project_network_nodes CASCADE;
DROP TABLE IF EXISTS public.project_network_ai_state CASCADE;

-- Remove schedule-related columns from tasks table
ALTER TABLE public.tasks 
DROP COLUMN IF EXISTS activity_name,
DROP COLUMN IF EXISTS percent_complete,
DROP COLUMN IF EXISTS assignee,
DROP COLUMN IF EXISTS duration,
DROP COLUMN IF EXISTS start_date,
DROP COLUMN IF EXISTS end_date;

-- Remove 'schedule' from company modules
DELETE FROM public.company_modules WHERE module_name = 'schedule';

-- Update the initialize_company_modules function to exclude schedule
CREATE OR REPLACE FUNCTION public.initialize_company_modules(target_company_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  module_name_val text;
  module_names text[] := ARRAY[
    'projects',
    'finance', 
    'sales',
    'dashboard',
    'digital-twin',
    'cost-contracts',
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
$function$;