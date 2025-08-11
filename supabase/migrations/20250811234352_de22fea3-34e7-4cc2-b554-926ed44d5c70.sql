-- Fix company_id mismatch for Frame Stage activities
-- Update activities to use the correct company_id that matches the project

UPDATE public.activities 
SET company_id = '4042458b-8e95-4842-90d9-29f43815ecf8'
WHERE project_id = '844f29f2-fff0-43c0-943b-cef8add9e563' 
AND stage = '5.2 FRAME STAGE'
AND company_id = 'df0df659-7e4c-41c4-a028-495539a0b556';