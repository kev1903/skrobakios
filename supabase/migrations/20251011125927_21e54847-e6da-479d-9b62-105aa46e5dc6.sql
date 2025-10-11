-- Insert the 4 document categories
INSERT INTO document_categories (name, description, document_type, section_number, section_name, sort_order, is_active)
VALUES 
  ('Architectural', 'Architectural drawings and plans', 'drawing', 1, 'Design Documents', 1, true),
  ('Structural Engineering', 'Structural engineering drawings and calculations', 'drawing', 1, 'Design Documents', 2, true),
  ('Energy Report', 'Energy efficiency and compliance reports', 'report', 1, 'Design Documents', 3, true),
  ('Soil Report', 'Geotechnical and soil investigation reports', 'report', 1, 'Design Documents', 4, true);