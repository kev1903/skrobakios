-- Add category_id column to project_documents table
ALTER TABLE project_documents 
ADD COLUMN category_id uuid REFERENCES document_categories(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_project_documents_category_id ON project_documents(category_id);

-- Update existing document to have a proper category
-- This document appears to be an energy-endorsed drawing based on the filename
UPDATE project_documents 
SET category_id = (SELECT id FROM document_categories WHERE name = 'Energy-Endorsed Drawings' LIMIT 1)
WHERE document_type = 'drawing' AND category_id IS NULL;