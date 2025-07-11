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