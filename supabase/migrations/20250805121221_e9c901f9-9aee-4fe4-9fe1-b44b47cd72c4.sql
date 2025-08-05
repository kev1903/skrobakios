-- Create a table for daily priorities and notes
CREATE TABLE public.daily_priorities_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  priorities TEXT[] DEFAULT ARRAY['', '', ''],
  priority_checked BOOLEAN[] DEFAULT ARRAY[false, false, false],
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one record per user per day
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.daily_priorities_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own daily priorities and notes" 
ON public.daily_priorities_notes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily priorities and notes" 
ON public.daily_priorities_notes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily priorities and notes" 
ON public.daily_priorities_notes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily priorities and notes" 
ON public.daily_priorities_notes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_daily_priorities_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_priorities_notes_updated_at
BEFORE UPDATE ON public.daily_priorities_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_daily_priorities_notes_updated_at();