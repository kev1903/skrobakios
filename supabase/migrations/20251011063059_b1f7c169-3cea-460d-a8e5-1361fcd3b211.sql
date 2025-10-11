-- Update the check constraint for document statuses
ALTER TABLE project_documents DROP CONSTRAINT IF EXISTS project_documents_status_check;

ALTER TABLE project_documents 
ADD CONSTRAINT project_documents_status_check 
CHECK (document_status IS NULL OR document_status IN (
  'issue_for_review',
  'issue_for_approval',
  'issue_for_construction',
  'issue_for_use',
  'void'
));

-- Update existing document_status_enum type
DROP TYPE IF EXISTS document_status_enum CASCADE;

CREATE TYPE document_status_enum AS ENUM (
  'issue_for_review',
  'issue_for_approval',
  'issue_for_construction',
  'issue_for_use',
  'void'
);

COMMENT ON TYPE document_status_enum IS 'Document statuses: issue_for_review (ready for review), issue_for_approval (ready for approval), issue_for_construction (approved for construction), issue_for_use (approved for use), void (invalid/cancelled)';