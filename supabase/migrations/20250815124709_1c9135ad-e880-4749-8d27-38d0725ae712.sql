-- Delete the sample projects that were added in the previous migration
-- These are the 5 projects with generic names created on 2025-08-15 12:40:44
DELETE FROM projects 
WHERE created_at = '2025-08-15 12:40:44.081388+00:00'
AND name IN (
  'Melbourne Office Renovation',
  'Sydney Warehouse Construction', 
  'Brisbane Residential Complex',
  'Perth Shopping Center Expansion',
  'Adelaide Hospital Wing'
);