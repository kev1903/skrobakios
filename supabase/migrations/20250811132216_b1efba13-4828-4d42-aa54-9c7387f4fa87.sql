-- Delete all activities for the current project (5 Thanet Street)
DELETE FROM activities 
WHERE project_id = '844f29f2-fff0-43c0-943b-cef8add9e563';

-- Create basic stage parent entries to maintain the stage structure
INSERT INTO activities (
  project_id,
  company_id,
  name,
  description,
  stage,
  level,
  cost_est,
  cost_actual,
  is_expanded,
  sort_order,
  dependencies
) VALUES 
(
  '844f29f2-fff0-43c0-943b-cef8add9e563',
  '4042458b-8e95-4842-90d9-29f43815ecf8',
  '4.0 PRELIMINARY STAGE',
  'Preliminary stage activities',
  '4.0 PRELIMINARY',
  0,
  0,
  0,
  false,
  1,
  '{}'
),
(
  '844f29f2-fff0-43c0-943b-cef8add9e563',
  '4042458b-8e95-4842-90d9-29f43815ecf8',
  '5.1 BASE STAGE',
  'Base stage activities',
  '5.1 BASE STAGE',
  0,
  0,
  0,
  false,
  2,
  '{}'
);