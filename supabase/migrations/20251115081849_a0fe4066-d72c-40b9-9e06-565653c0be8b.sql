-- Grant manage_projects permission to the user for the Ardelle company
-- This fixes the "Failed to create project" issue where the user couldn't create
-- projects because they lacked the required permission for their current company

INSERT INTO user_permissions (user_id, company_id, permission_key)
VALUES (
  'd8291518-a175-4919-bb2a-30e4fd470bef',
  '474effb0-2704-4098-81b2-82d9c44eaf6b',  -- Ardelle company
  'manage_projects'
)
ON CONFLICT (user_id, company_id, permission_key) DO NOTHING;