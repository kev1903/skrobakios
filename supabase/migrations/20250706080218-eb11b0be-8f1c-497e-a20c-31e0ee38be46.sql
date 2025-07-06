-- Create storage bucket for task attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('task-attachments', 'task-attachments', true);

-- Create policies for task attachment uploads
CREATE POLICY "Anyone can view task attachment files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'task-attachments');

CREATE POLICY "Anyone can upload task attachment files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'task-attachments');

CREATE POLICY "Anyone can update task attachment files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'task-attachments');

CREATE POLICY "Anyone can delete task attachment files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'task-attachments');