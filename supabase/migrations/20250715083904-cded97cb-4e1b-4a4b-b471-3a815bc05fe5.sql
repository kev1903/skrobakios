-- Insert sample subscription plans if they don't exist
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, max_projects, max_team_members, max_storage_gb, sort_order, is_active) 
SELECT 'Free', 'Basic features for individual use', 0, 0, ARRAY['basic_dashboard', 'basic_tasks', 'basic_files', 'basic_support'], 1, 1, 1, 1, true
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Free');

INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, max_projects, max_team_members, max_storage_gb, sort_order, is_active) 
SELECT 'Basic', 'Essential features for small teams', 19, 190, ARRAY['basic_dashboard', 'basic_tasks', 'basic_files', 'basic_support', 'projects', 'team_management', 'basic_reports'], 5, 5, 10, 2, true
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Basic');

INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, max_projects, max_team_members, max_storage_gb, sort_order, is_active) 
SELECT 'Project Management', 'Complete project management solution with advanced features', 49, 490, ARRAY['basic_dashboard', 'basic_tasks', 'basic_files', 'basic_support', 'projects', 'team_management', 'basic_reports', 'advanced_projects', 'cost_contracts', 'advanced_reports', 'priority_support'], 20, 15, 50, 3, true
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Project Management');

INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, max_projects, max_team_members, max_storage_gb, sort_order, is_active) 
SELECT 'Business Management', 'Comprehensive business management suite for large organizations', 99, 990, ARRAY['basic_dashboard', 'basic_tasks', 'basic_files', 'basic_support', 'projects', 'team_management', 'basic_reports', 'advanced_projects', 'cost_contracts', 'advanced_reports', 'priority_support', 'sales_management', 'advanced_analytics', 'custom_integrations', 'dedicated_support'], NULL, NULL, 200, 4, true
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Business Management');