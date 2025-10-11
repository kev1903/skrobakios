-- Create enum type for document statuses
DO $$ BEGIN
  CREATE TYPE document_status_enum AS ENUM (
    'draft',
    'for_review',
    'under_review',
    'approved',
    'final',
    'superseded',
    'void',
    'archived'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add comment to explain the enum values
COMMENT ON TYPE document_status_enum IS 'Document lifecycle statuses: draft (initial), for_review (ready for review), under_review (being reviewed), approved (approved but not final), final (approved and issued), superseded (replaced by newer version), void (invalid/cancelled), archived (stored for record)';

-- Update project_documents table to use the enum (optional - keeping as text for flexibility but documenting valid values)
-- We'll keep it as text but add a check constraint for valid values
ALTER TABLE project_documents DROP CONSTRAINT IF EXISTS project_documents_status_check;

ALTER TABLE project_documents 
ADD CONSTRAINT project_documents_status_check 
CHECK (document_status IS NULL OR document_status IN (
  'draft',
  'for_review', 
  'under_review',
  'approved',
  'final',
  'superseded',
  'void',
  'archived'
));