-- Add prompt_id column to skai_knowledge table for easy referencing in AI prompts
ALTER TABLE skai_knowledge 
ADD COLUMN prompt_id TEXT UNIQUE;

-- Add index for faster lookups by prompt_id
CREATE INDEX idx_skai_knowledge_prompt_id ON skai_knowledge(prompt_id);

-- Add comment to explain the field
COMMENT ON COLUMN skai_knowledge.prompt_id IS 'Human-readable ID for referencing this knowledge entry in AI prompts (e.g., FIN-001, SAFETY-POLICY-01)';