-- Add AI configuration fields to document_categories table
ALTER TABLE document_categories 
ADD COLUMN ai_prompt TEXT,
ADD COLUMN ai_instructions TEXT,
ADD COLUMN ai_guardrails TEXT,
ADD COLUMN ai_framework TEXT;