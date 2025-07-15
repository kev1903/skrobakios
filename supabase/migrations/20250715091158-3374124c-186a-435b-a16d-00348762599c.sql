-- Update subscription plans with correct features based on subscription types
UPDATE subscription_plans 
SET features = ARRAY[
  'basic_dashboard',
  'basic_tasks', 
  'basic_files',
  'basic_support',
  'projects',
  'team_management',
  'basic_reports',
  'advanced_projects',
  'cost_contracts',
  'advanced_reports',
  'priority_support'
]
WHERE name = 'Project Management';

UPDATE subscription_plans 
SET features = ARRAY[
  'basic_dashboard',
  'basic_tasks',
  'basic_files', 
  'basic_support',
  'projects',
  'team_management',
  'basic_reports',
  'advanced_projects',
  'cost_contracts',
  'advanced_reports',
  'priority_support',
  'sales_management',
  'advanced_analytics',
  'custom_integrations',
  'dedicated_support'
]
WHERE name = 'Business Management';