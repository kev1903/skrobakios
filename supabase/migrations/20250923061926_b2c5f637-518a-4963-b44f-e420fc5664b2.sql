-- Add attachments column to issue_reports table
ALTER TABLE public.issue_reports 
ADD COLUMN attachments jsonb DEFAULT '[]'::jsonb;

-- Create storage bucket for issue report attachments if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('issue-report-attachments', 'issue-report-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for issue report attachments
CREATE POLICY "Issue report attachments are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'issue-report-attachments');

CREATE POLICY "Users can upload issue report attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'issue-report-attachments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their issue report attachments" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'issue-report-attachments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their issue report attachments" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'issue-report-attachments' AND auth.uid() IS NOT NULL);