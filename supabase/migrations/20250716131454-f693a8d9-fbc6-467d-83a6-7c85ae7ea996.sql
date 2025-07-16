-- Create activities table as the core unit linking Time, Cost, Scope, and Quality
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration INTERVAL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  dependencies TEXT[] DEFAULT '{}',
  cost_est DECIMAL(10,2) DEFAULT 0,
  cost_actual DECIMAL(10,2) DEFAULT 0,
  quality_metrics JSONB DEFAULT '{}',
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user-owned access
CREATE POLICY "Users can view activities from their companies" 
ON public.activities 
FOR SELECT 
USING (company_id IN (
  SELECT cm.company_id
  FROM company_members cm
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

CREATE POLICY "Users can create activities in their companies" 
ON public.activities 
FOR INSERT 
WITH CHECK (company_id IN (
  SELECT cm.company_id
  FROM company_members cm
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

CREATE POLICY "Users can update activities in their companies" 
ON public.activities 
FOR UPDATE 
USING (company_id IN (
  SELECT cm.company_id
  FROM company_members cm
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

CREATE POLICY "Users can delete activities in their companies" 
ON public.activities 
FOR DELETE 
USING (company_id IN (
  SELECT cm.company_id
  FROM company_members cm
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_activities_updated_at
BEFORE UPDATE ON public.activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime subscriptions
ALTER TABLE public.activities REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;