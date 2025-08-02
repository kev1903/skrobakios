-- Create time_entries table for tracking work time
CREATE TABLE IF NOT EXISTS public.time_entries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    task_activity TEXT NOT NULL,
    project_name TEXT,
    category TEXT,
    notes TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- Duration in seconds
    status TEXT NOT NULL DEFAULT 'running', -- 'running', 'paused', 'completed'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create time_tracking_settings table for user preferences
CREATE TABLE IF NOT EXISTS public.time_tracking_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    productive_categories TEXT[] DEFAULT ARRAY['Work', 'Development', 'Meeting', 'Research'],
    default_work_hours INTEGER DEFAULT 8,
    category_colors JSONB DEFAULT '{}',
    auto_break_reminder BOOLEAN DEFAULT true,
    break_reminder_interval INTEGER DEFAULT 60, -- minutes
    daily_goal_hours INTEGER DEFAULT 8,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_tracking_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for time_entries
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

-- RLS Policies for time_tracking_settings
CREATE POLICY "Users can view their own time tracking settings" 
ON public.time_tracking_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own time tracking settings" 
ON public.time_tracking_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time tracking settings" 
ON public.time_tracking_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON public.time_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON public.time_entries(status);
CREATE INDEX IF NOT EXISTS idx_time_tracking_settings_user_id ON public.time_tracking_settings(user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_time_entries_updated_at
    BEFORE UPDATE ON public.time_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_tracking_settings_updated_at
    BEFORE UPDATE ON public.time_tracking_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();