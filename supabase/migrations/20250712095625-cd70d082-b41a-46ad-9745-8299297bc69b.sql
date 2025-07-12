-- Move all projects from accounts@skrobaki.com's company to Skrobaki company
UPDATE projects 
SET company_id = '12001998-c62a-47d4-8f1b-d39ba16073c1'
WHERE company_id = '41568b6d-596b-437a-bc1c-dffed04c3421';

-- Also update any related data that references company_id
UPDATE digital_objects 
SET company_id = '12001998-c62a-47d4-8f1b-d39ba16073c1'
WHERE company_id = '41568b6d-596b-437a-bc1c-dffed04c3421';

UPDATE leads 
SET company_id = '12001998-c62a-47d4-8f1b-d39ba16073c1'
WHERE company_id = '41568b6d-596b-437a-bc1c-dffed04c3421';

UPDATE estimates 
SET company_id = '12001998-c62a-47d4-8f1b-d39ba16073c1'
WHERE company_id = '41568b6d-596b-437a-bc1c-dffed04c3421';

UPDATE wbs_items 
SET company_id = '12001998-c62a-47d4-8f1b-d39ba16073c1'
WHERE company_id = '41568b6d-596b-437a-bc1c-dffed04c3421';

UPDATE time_entries 
SET company_id = '12001998-c62a-47d4-8f1b-d39ba16073c1'
WHERE company_id = '41568b6d-596b-437a-bc1c-dffed04c3421';