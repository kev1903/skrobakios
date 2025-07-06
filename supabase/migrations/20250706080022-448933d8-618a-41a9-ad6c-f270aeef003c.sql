-- Create task_attachments table
CREATE TABLE public.task_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  file_url TEXT NOT NULL,
  uploaded_by_name TEXT,
  uploaded_by_avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for task attachments
CREATE POLICY "Anyone can view task attachments" 
ON public.task_attachments 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create task attachments" 
ON public.task_attachments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update task attachments" 
ON public.task_attachments 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete task attachments" 
ON public.task_attachments 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_task_attachments_updated_at
BEFORE UPDATE ON public.task_attachments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();