-- Cleanup non-business accounts - keep only Skrobaki, Skrobaki PM, and Courtscapes

-- Create a function to safely delete non-business companies
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
  -- Loop through all companies that are not in the keep list
  FOR company_record IN 
    SELECT id, name 
    FROM companies 
    WHERE id != ALL(keep_company_ids)
    ORDER BY name
  LOOP
    -- Delete the company and all related data
    BEGIN
      -- Delete company members first
      DELETE FROM company_members WHERE company_id = company_record.id;
      
      -- Delete company modules
      DELETE FROM company_modules WHERE company_id = company_record.id;
      
      -- Delete leads
      DELETE FROM leads WHERE company_id = company_record.id;
      
      -- Delete time entries
      DELETE FROM time_entries WHERE company_id = company_record.id;
      
      -- Delete projects and related data
      DELETE FROM projects WHERE company_id = company_record.id;
      
      -- Delete estimates
      DELETE FROM estimates WHERE company_id = company_record.id;
      
      -- Delete stakeholders
      DELETE FROM stakeholders WHERE company_id = company_record.id;
      
      -- Delete project costs
      DELETE FROM project_costs WHERE company_id = company_record.id;
      
      -- Delete activities
      DELETE FROM activities WHERE company_id = company_record.id;
      
      -- Delete issue reports
      DELETE FROM issue_reports WHERE company_id = company_record.id;
      
      -- Delete SK design tasks
      DELETE FROM sk_25008_design WHERE company_id = company_record.id;
      
      -- Finally delete the company itself
      DELETE FROM companies WHERE id = company_record.id;
      
      result := json_build_object(
        'success', true,
        'message', 'Company deleted successfully'
      );
      
    EXCEPTION WHEN OTHERS THEN
      result := json_build_object(
        'success', false,
        'error', SQLERRM
      );
    END;
    
    -- Return the result for this company
    deleted_company_id := company_record.id;
    company_name := company_record.name;
    deletion_result := result;
    
    RETURN NEXT;
  END LOOP;
  
  RETURN;
END;
$$;

-- Execute the cleanup (this will delete all companies except the 3 specified)
SELECT * FROM cleanup_non_business_accounts();