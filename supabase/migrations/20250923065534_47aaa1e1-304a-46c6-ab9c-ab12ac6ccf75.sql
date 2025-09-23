-- Create issue-attachments storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('issue-attachments', 'issue-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create RLS policies for issue-attachments bucket
CREATE POLICY "Anyone can view issue attachments" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'issue-attachments');

CREATE POLICY "Anyone can upload issue attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'issue-attachments');

CREATE POLICY "Anyone can update issue attachments" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'issue-attachments');

CREATE POLICY "Anyone can delete issue attachments" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'issue-attachments');