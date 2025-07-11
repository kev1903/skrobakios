-- Create the user_role enum type
CREATE TYPE user_role AS ENUM (
  'superadmin',
  'admin', 
  'user',
  'project_manager',
  'project_admin',
  'consultant',
  'subcontractor',
  'estimator',
  'accounts',
  'client_viewer'
);

-- Update the user_roles table to use the enum
ALTER TABLE user_roles ALTER COLUMN role TYPE user_role USING role::user_role;