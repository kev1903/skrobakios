-- Insert default superadmin role for the current user
INSERT INTO public.user_roles (user_id, role)
SELECT '5213f4be-54a3-4985-a88e-e460154e52fd'::uuid, 'superadmin'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd'::uuid 
  AND role = 'superadmin'::app_role
);

-- Insert some default feature flags using the correct column names
INSERT INTO public.feature_flags (flag_name, flag_key, description, is_enabled) VALUES
('Maintenance Mode', 'maintenance_mode', 'Enable/disable maintenance mode', false),
('New User Registration', 'new_user_registration', 'Allow new user registrations', true),
('Enhanced Logging', 'enhanced_logging', 'Enable enhanced application logging', false),
('Beta Features', 'beta_features', 'Enable beta features for testing', false)
ON CONFLICT (flag_name) DO NOTHING;