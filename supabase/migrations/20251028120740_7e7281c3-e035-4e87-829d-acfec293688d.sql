-- Allow anonymous users to upload to task-attachments bucket for public submissions
CREATE POLICY "Anonymous users can upload task attachments"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'task-attachments');

-- Allow anonymous users to create task attachment records
CREATE POLICY "Anonymous users can create task attachment records"
ON public.task_attachments
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous users to create review tasks
CREATE POLICY "Anonymous users can create review tasks"
ON public.tasks
FOR INSERT
TO anon
WITH CHECK (task_type = 'Review');