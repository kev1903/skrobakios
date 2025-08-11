-- Copy activities from Riverview project to Thanet Street project
INSERT INTO activities (
  project_id,
  company_id,
  name,
  description,
  stage,
  parent_id,
  level,
  start_date,
  end_date,
  duration,
  cost_est,
  cost_actual,
  quality_metrics,
  is_expanded,
  sort_order,
  dependencies
)
SELECT 
  '844f29f2-fff0-43c0-943b-cef8add9e563' as project_id, -- 5 Thanet Street project
  company_id,
  name,
  description,
  stage,
  parent_id,
  level,
  start_date,
  end_date,
  duration,
  cost_est,
  cost_actual,
  quality_metrics,
  is_expanded,
  sort_order,
  dependencies
FROM activities 
WHERE project_id = '6dc04dd7-a1bb-43cc-a113-40e27f0f64d0';