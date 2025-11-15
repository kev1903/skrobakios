
-- Grant project management permissions to the logged-in user (kevin@skrobaki.com)
-- User ID: 5213f4be-54a3-4985-a88e-e460154e52fd
-- Company: Skrobaki (4042458b-8e95-4842-90d9-29f43815ecf8)

INSERT INTO user_permissions (user_id, company_id, permission_key, granted)
VALUES 
  ('5213f4be-54a3-4985-a88e-e460154e52fd', '4042458b-8e95-4842-90d9-29f43815ecf8', 'manage_projects', true),
  ('5213f4be-54a3-4985-a88e-e460154e52fd', '4042458b-8e95-4842-90d9-29f43815ecf8', 'manage_company_projects', true)
ON CONFLICT (user_id, company_id, permission_key) 
DO UPDATE SET granted = true;
