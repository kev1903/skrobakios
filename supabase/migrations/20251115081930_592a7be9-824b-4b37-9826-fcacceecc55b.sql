-- Update the permission to set granted = true
-- The previous insert created the row but didn't set granted = true
UPDATE user_permissions
SET granted = true,
    granted_at = NOW(),
    granted_by = 'd8291518-a175-4919-bb2a-30e4fd470bef'
WHERE user_id = 'd8291518-a175-4919-bb2a-30e4fd470bef'
  AND company_id = '474effb0-2704-4098-81b2-82d9c44eaf6b'
  AND permission_key = 'manage_projects';