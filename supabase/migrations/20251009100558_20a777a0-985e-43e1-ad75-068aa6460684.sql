-- Add document_status column to project_documents table
ALTER TABLE project_documents 
ADD COLUMN IF NOT EXISTS document_status text 
CHECK (document_status IN ('Issue for Review', 'Issue for Approval', 'Issue for Construction', 'Issue for Use'))
DEFAULT NULL;