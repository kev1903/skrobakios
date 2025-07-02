-- Create WBS table for Work Breakdown Structure
CREATE TABLE public.wbs_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.wbs_items(id) ON DELETE CASCADE,
  wbs_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  start_date DATE,
  end_date DATE,
  duration INTEGER DEFAULT 0,
  budgeted_cost DECIMAL(12,2),
  actual_cost DECIMAL(12,2),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  level INTEGER DEFAULT 0,
  is_expanded BOOLEAN DEFAULT false,
  linked_tasks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.wbs_items ENABLE ROW LEVEL SECURITY;

-- Create policies for WBS items access
CREATE POLICY "Anyone can view WBS items" 
ON public.wbs_items 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create WBS items" 
ON public.wbs_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update WBS items" 
ON public.wbs_items 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete WBS items" 
ON public.wbs_items 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_wbs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_wbs_items_updated_at
BEFORE UPDATE ON public.wbs_items
FOR EACH ROW
EXECUTE FUNCTION public.update_wbs_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_wbs_items_project_id ON public.wbs_items(project_id);
CREATE INDEX idx_wbs_items_parent_id ON public.wbs_items(parent_id);
CREATE INDEX idx_wbs_items_level ON public.wbs_items(level);