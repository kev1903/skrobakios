-- Create time_entries table for time tracking
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER, -- duration in minutes, calculated from start/end time
  task_activity TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  project_name TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT FALSE, -- for tracking if timer is currently running
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for time entries
CREATE POLICY "Users can view their own time entries" 
ON public.time_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own time entries" 
ON public.time_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries" 
ON public.time_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time entries" 
ON public.time_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_time_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_time_entries_updated_at
BEFORE UPDATE ON public.time_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_time_entries_updated_at();

-- Create time_tracking_settings table for user preferences
CREATE TABLE public.time_tracking_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  productive_categories TEXT[] DEFAULT ARRAY['Design', 'Deep Work', 'Admin'],
  default_work_start TIME DEFAULT '08:00:00',
  default_work_end TIME DEFAULT '18:00:00',
  category_colors JSONB DEFAULT '{
    "Design": "#3B82F6",
    "Admin": "#10B981", 
    "Calls": "#F59E0B",
    "Break": "#EF4444",
    "Browsing": "#8B5CF6",
    "Site Visit": "#06B6D4",
    "Deep Work": "#059669",
    "Other": "#6B7280"
  }',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.time_tracking_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for time tracking settings
CREATE POLICY "Users can view their own settings" 
ON public.time_tracking_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" 
ON public.time_tracking_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.time_tracking_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for settings timestamp updates
CREATE TRIGGER update_time_tracking_settings_updated_at
BEFORE UPDATE ON public.time_tracking_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();