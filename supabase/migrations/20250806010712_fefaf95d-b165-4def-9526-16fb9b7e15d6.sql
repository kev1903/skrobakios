-- Create daily_data table for Today's Overview functionality
CREATE TABLE public.daily_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  priorities TEXT[] DEFAULT ARRAY['', '', ''],
  priority_checked BOOLEAN[] DEFAULT ARRAY[false, false, false],
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.daily_data ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own daily data" 
ON public.daily_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily data" 
ON public.daily_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily data" 
ON public.daily_data 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily data" 
ON public.daily_data 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_data_updated_at
BEFORE UPDATE ON public.daily_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();