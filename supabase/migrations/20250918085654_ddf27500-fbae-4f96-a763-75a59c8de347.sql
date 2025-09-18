-- Fix search path security warnings for new function
CREATE OR REPLACE FUNCTION cleanup_non_business_accounts()
RETURNS TABLE(deleted_company_id uuid, company_name text, deletion_result jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  company_record RECORD;
  result jsonb;
  keep_company_ids uuid[] := ARRAY[
    '4042458b-8e95-4842-90d9-29f43815ecf8'::uuid,  -- Skrobaki (main)
    '31f76099-3d79-4c14-bbdf-ae7a2dc0d3e5'::uuid,  -- Skrobaki PM (completed onboarding)
    'df0df659-7e4c-41c4-a028-495539a0b556'::uuid   -- Courtscapes (completed onboarding)
  ];
BEGIN
  -- Note: This function has already been executed and served its purpose
  -- It's being updated for security compliance only
  RETURN;
END;
$$;