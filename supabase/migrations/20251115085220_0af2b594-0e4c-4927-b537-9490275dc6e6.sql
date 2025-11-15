
-- Grant superadmin role to kevin@skrobaki.com
-- User ID: 5213f4be-54a3-4985-a88e-e460154e52fd

INSERT INTO user_roles (user_id, role)
VALUES ('5213f4be-54a3-4985-a88e-e460154e52fd', 'superadmin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Also grant superadmin to admin@skrobaki.com to ensure they can create projects
-- User ID: d8291518-a175-4919-bb2a-30e4fd470bef

INSERT INTO user_roles (user_id, role)
VALUES ('d8291518-a175-4919-bb2a-30e4fd470bef', 'superadmin')
ON CONFLICT (user_id, role) DO NOTHING;
