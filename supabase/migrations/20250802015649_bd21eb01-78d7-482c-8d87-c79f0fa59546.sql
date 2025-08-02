-- Create time_blocks table for timeblocking functionality
CREATE TABLE public.time_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TEXT NOT NULL, -- Format: "HH:MM"
  end_time TEXT NOT NULL,   -- Format: "HH:MM"
  category TEXT NOT NULL DEFAULT 'work',
  color TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for time_blocks
CREATE POLICY "Users can view their own time blocks" 
ON public.time_blocks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own time blocks" 
ON public.time_blocks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time blocks" 
ON public.time_blocks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time blocks" 
ON public.time_blocks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_time_blocks_updated_at
BEFORE UPDATE ON public.time_blocks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraint to company_id
ALTER TABLE public.time_blocks 
ADD CONSTRAINT time_blocks_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;