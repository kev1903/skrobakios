-- Create function to update timestamps first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create digital_objects table to support the digital objects functionality
CREATE TABLE public.digital_objects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  object_type TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning',
  stage TEXT NOT NULL DEFAULT '4.0 PRELIMINARY',
  level INTEGER NOT NULL DEFAULT 0,
  parent_id UUID REFERENCES public.digital_objects(id),
  expanded BOOLEAN DEFAULT true,
  project_id UUID REFERENCES public.projects(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.digital_objects ENABLE ROW LEVEL SECURITY;

-- Create policies  
CREATE POLICY "Anyone can view digital objects" ON public.digital_objects FOR SELECT USING (true);
CREATE POLICY "Anyone can create digital objects" ON public.digital_objects FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update digital objects" ON public.digital_objects FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete digital objects" ON public.digital_objects FOR DELETE USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_digital_objects_updated_at
BEFORE UPDATE ON public.digital_objects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();