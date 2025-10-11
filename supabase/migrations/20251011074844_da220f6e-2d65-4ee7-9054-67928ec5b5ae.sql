-- Extend skai_knowledge table with AI processing fields
ALTER TABLE skai_knowledge 
ADD COLUMN IF NOT EXISTS ai_confidence numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS processing_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS last_processed_at timestamptz,
ADD COLUMN IF NOT EXISTS source_ids jsonb DEFAULT '[]'::jsonb;

-- Create knowledge sync jobs table for background processing
CREATE TABLE IF NOT EXISTS knowledge_sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  company_id uuid NOT NULL,
  status text DEFAULT 'pending', -- pending, processing, completed, failed
  job_type text NOT NULL, -- document, invoice, quote, full_sync
  source_id uuid, -- ID of document/invoice/quote
  error_message text,
  retry_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE knowledge_sync_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policy for viewing sync jobs
CREATE POLICY "Users can view sync jobs for their companies"
ON knowledge_sync_jobs FOR SELECT
USING (company_id IN (
  SELECT company_id FROM company_members 
  WHERE user_id = auth.uid() AND status = 'active'
));

-- Function to trigger knowledge sync
CREATE OR REPLACE FUNCTION trigger_knowledge_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if document processing is completed
  IF TG_TABLE_NAME = 'project_documents' AND NEW.processing_status != 'completed' THEN
    RETURN NEW;
  END IF;

  -- Insert job into queue
  INSERT INTO knowledge_sync_jobs (
    project_id, 
    company_id, 
    job_type, 
    source_id
  ) VALUES (
    NEW.project_id,
    (SELECT company_id FROM projects WHERE id = NEW.project_id),
    TG_ARGV[0], -- job_type passed as argument
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger on document upload (only when processing is completed)
DROP TRIGGER IF EXISTS auto_sync_document_knowledge ON project_documents;
CREATE TRIGGER auto_sync_document_knowledge
AFTER INSERT OR UPDATE ON project_documents
FOR EACH ROW
WHEN (NEW.processing_status = 'completed')
EXECUTE FUNCTION trigger_knowledge_sync('document');

-- Create index for faster job queries
CREATE INDEX IF NOT EXISTS idx_knowledge_sync_jobs_status 
ON knowledge_sync_jobs(status, created_at);

CREATE INDEX IF NOT EXISTS idx_knowledge_sync_jobs_project 
ON knowledge_sync_jobs(project_id, company_id);