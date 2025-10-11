-- Enable RLS on document_categories table if not already enabled
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view document categories (read-only)
CREATE POLICY "Anyone can view document categories"
ON document_categories
FOR SELECT
TO authenticated
USING (true);