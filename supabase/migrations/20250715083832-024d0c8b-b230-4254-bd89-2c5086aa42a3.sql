-- Insert sample subscription plans if they don't exist
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, max_projects, max_team_members, max_storage_gb, sort_order, is_active) 
VALUES 
  ('Free', 'Basic features for individual use', 0, 0, ARRAY['basic_dashboard', 'basic_tasks', 'basic_files', 'basic_support'], 1, 1, 1, 1, true),
  ('Basic', 'Essential features for small teams', 19, 190, ARRAY['basic_dashboard', 'basic_tasks', 'basic_files', 'basic_support', 'projects', 'team_management', 'basic_reports'], 5, 5, 10, 2, true),
  ('Project Management', 'Complete project management solution with advanced features', 49, 490, ARRAY['basic_dashboard', 'basic_tasks', 'basic_files', 'basic_support', 'projects', 'team_management', 'basic_reports', 'advanced_projects', 'cost_contracts', 'advanced_reports', 'priority_support'], 20, 15, 50, 3, true),
  ('Business Management', 'Comprehensive business management suite for large organizations', 99, 990, ARRAY['basic_dashboard', 'basic_tasks', 'basic_files', 'basic_support', 'projects', 'team_management', 'basic_reports', 'advanced_projects', 'cost_contracts', 'advanced_reports', 'priority_support', 'sales_management', 'advanced_analytics', 'custom_integrations', 'dedicated_support'], NULL, NULL, 200, 4, true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  max_projects = EXCLUDED.max_projects,
  max_team_members = EXCLUDED.max_team_members,
  max_storage_gb = EXCLUDED.max_storage_gb,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;