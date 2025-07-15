-- First, create new unlimited Personal and Business plans
INSERT INTO subscription_plans (
  name,
  description,
  price_monthly,
  price_yearly,
  max_projects,
  max_team_members,
  max_storage_gb,
  features,
  sort_order,
  is_active
) VALUES 
(
  'Personal',
  'Full access to all modules for personal use',
  0.00,
  0.00,
  NULL, -- Unlimited projects
  NULL, -- Unlimited team members
  NULL, -- Unlimited storage
  ARRAY[
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
  ],
  1,
  true
),
(
  'Business',
  'Full access to all modules for business use',
  0.00,
  0.00,
  NULL, -- Unlimited projects
  NULL, -- Unlimited team members
  NULL, -- Unlimited storage
  ARRAY[
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
  ],
  2,
  true
);

-- Update all existing user subscriptions to use the new Personal plan
UPDATE user_subscriptions 
SET plan_id = (SELECT id FROM subscription_plans WHERE name = 'Personal' LIMIT 1)
WHERE plan_id IS NOT NULL;

-- Now delete all old subscription plans except the new ones
DELETE FROM subscription_plans 
WHERE name NOT IN ('Personal', 'Business');