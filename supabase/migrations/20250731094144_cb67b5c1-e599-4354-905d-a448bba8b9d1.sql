-- Create time_blocks table for weekly recurring time blocks
CREATE TABLE public.time_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('work', 'personal', 'meeting', 'break', 'family', 'site_visit', 'church', 'rest')),
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;

-- Create policies for time blocks
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

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_time_blocks_updated_at
BEFORE UPDATE ON public.time_blocks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_time_blocks_user_day ON public.time_blocks(user_id, day_of_week);