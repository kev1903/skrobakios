-- Step 1: Drop all existing triggers and functions with CASCADE
DROP TRIGGER IF EXISTS set_issue_number ON public.issues CASCADE;
DROP TRIGGER IF EXISTS set_issue_number_trigger ON public.issues CASCADE;
DROP TRIGGER IF EXISTS set_rfi_number ON public.issues CASCADE;
DROP FUNCTION IF EXISTS public.set_issue_number() CASCADE;
DROP FUNCTION IF EXISTS public.set_rfi_number() CASCADE;

-- Step 2: Rename the column from issue_number to rfi_number
ALTER TABLE public.issues RENAME COLUMN issue_number TO rfi_number;

-- Step 3: Check if generate_rfi_number exists, if not rename generate_issue_number
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'generate_rfi_number' AND pg_function_is_visible(oid)
  ) THEN
    -- Only rename if generate_issue_number exists
    IF EXISTS (
      SELECT 1 FROM pg_proc WHERE proname = 'generate_issue_number' AND pg_function_is_visible(oid)
    ) THEN
      ALTER FUNCTION public.generate_issue_number(uuid) RENAME TO generate_rfi_number;
    END IF;
  END IF;
END
$$;

-- Step 4: Create the new trigger function
CREATE OR REPLACE FUNCTION public.set_rfi_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF NEW.rfi_number IS NULL OR NEW.rfi_number = '' THEN
    NEW.rfi_number := public.generate_rfi_number(NEW.project_id);
  END IF;
  RETURN NEW;
END;
$function$;

-- Step 5: Create the trigger
CREATE TRIGGER set_rfi_number
  BEFORE INSERT ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION public.set_rfi_number();