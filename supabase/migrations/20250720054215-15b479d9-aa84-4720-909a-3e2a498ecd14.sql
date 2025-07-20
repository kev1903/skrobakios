-- Create user_sort_preferences table to store column sorting preferences
CREATE TABLE public.user_sort_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  sort_field TEXT NOT NULL,
  sort_direction TEXT NOT NULL CHECK (sort_direction IN ('asc', 'desc')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, table_name)
);

-- Enable Row Level Security
ALTER TABLE public.user_sort_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own sort preferences" 
ON public.user_sort_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sort preferences" 
ON public.user_sort_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sort preferences" 
ON public.user_sort_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sort preferences" 
ON public.user_sort_preferences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_sort_preferences_updated_at
BEFORE UPDATE ON public.user_sort_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();