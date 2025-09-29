-- Create table for tracking daily project checks
CREATE TABLE public.project_daily_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  checked_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one check per project per user per day
  UNIQUE(project_id, user_id, checked_date)
);

-- Enable RLS
ALTER TABLE public.project_daily_checks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can create daily checks for accessible projects"
ON public.project_daily_checks
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Users can view daily checks for accessible projects"
ON public.project_daily_checks
FOR SELECT
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Users can update their own daily checks"
ON public.project_daily_checks
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily checks"
ON public.project_daily_checks
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_project_daily_checks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_project_daily_checks_updated_at
BEFORE UPDATE ON public.project_daily_checks
FOR EACH ROW
EXECUTE FUNCTION public.update_project_daily_checks_updated_at();

-- Create index for better performance
CREATE INDEX idx_project_daily_checks_project_date 
ON public.project_daily_checks(project_id, checked_date);

CREATE INDEX idx_project_daily_checks_user_date 
ON public.project_daily_checks(user_id, checked_date);