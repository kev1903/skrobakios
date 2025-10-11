-- Delete all document categories except the 4 in use
-- Keep: Architectural, Structural Engineering, Energy Report, Soil Report

DELETE FROM document_categories 
WHERE name NOT IN (
  'Architectural',
  'Structural Engineering', 
  'Energy Report',
  'Soil Report'
);