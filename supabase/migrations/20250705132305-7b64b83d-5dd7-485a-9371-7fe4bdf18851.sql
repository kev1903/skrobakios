-- Create digital_objects table with hierarchical structure
CREATE TABLE public.digital_objects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  parent_id UUID NULL,
  name TEXT NOT NULL,
  object_type TEXT NOT NULL DEFAULT 'component',
  description TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'planning',
  cost DECIMAL(12,2),
  start_date DATE,
  end_date DATE,
  assigned_to TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  level INTEGER DEFAULT 0,
  is_expanded BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.digital_objects 
ADD CONSTRAINT fk_digital_objects_project 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE public.digital_objects 
ADD CONSTRAINT fk_digital_objects_parent 
FOREIGN KEY (parent_id) REFERENCES public.digital_objects(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_digital_objects_project_id ON public.digital_objects(project_id);
CREATE INDEX idx_digital_objects_parent_id ON public.digital_objects(parent_id);
CREATE INDEX idx_digital_objects_level ON public.digital_objects(level);

-- Enable Row Level Security
ALTER TABLE public.digital_objects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view digital objects" 
ON public.digital_objects 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create digital objects" 
ON public.digital_objects 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update digital objects" 
ON public.digital_objects 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete digital objects" 
ON public.digital_objects 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_digital_objects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_digital_objects_updated_at
BEFORE UPDATE ON public.digital_objects
FOR EACH ROW
EXECUTE FUNCTION public.update_digital_objects_updated_at();

-- Insert sample data
INSERT INTO public.digital_objects (project_id, name, object_type, description, status, cost, level) VALUES
('00000000-0000-0000-0000-000000000001', 'Building Structure', 'structure', 'Main building structural components', 'in_progress', 250000.00, 0),
('00000000-0000-0000-0000-000000000001', 'Foundation', 'foundation', 'Building foundation system', 'completed', 75000.00, 1),
('00000000-0000-0000-0000-000000000001', 'Framing', 'framing', 'Steel and concrete framing', 'in_progress', 125000.00, 1),
('00000000-0000-0000-0000-000000000001', 'MEP Systems', 'systems', 'Mechanical, Electrical, and Plumbing', 'planning', 180000.00, 0),
('00000000-0000-0000-0000-000000000001', 'HVAC', 'mechanical', 'Heating, Ventilation, and Air Conditioning', 'planning', 85000.00, 1),
('00000000-0000-0000-0000-000000000001', 'Electrical', 'electrical', 'Electrical systems and lighting', 'planning', 65000.00, 1),
('00000000-0000-0000-0000-000000000001', 'Plumbing', 'plumbing', 'Water supply and drainage systems', 'planning', 30000.00, 1);

-- Update parent_id for hierarchical relationships
UPDATE public.digital_objects SET parent_id = (
  SELECT id FROM public.digital_objects WHERE name = 'Building Structure' LIMIT 1
) WHERE name IN ('Foundation', 'Framing');

UPDATE public.digital_objects SET parent_id = (
  SELECT id FROM public.digital_objects WHERE name = 'MEP Systems' LIMIT 1
) WHERE name IN ('HVAC', 'Electrical', 'Plumbing');