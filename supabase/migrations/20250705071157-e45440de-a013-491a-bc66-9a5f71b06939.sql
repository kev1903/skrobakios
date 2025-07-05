-- Create storage bucket for 3D models
INSERT INTO storage.buckets (id, name, public) 
VALUES ('3d-models', '3d-models', true);

-- Create policies for 3D model uploads
CREATE POLICY "3D models are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = '3d-models');

CREATE POLICY "Authenticated users can upload 3D models" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = '3d-models' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update 3D models" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = '3d-models' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete 3D models" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = '3d-models' AND auth.role() = 'authenticated');

-- Create table for 3D model metadata
CREATE TABLE public.model_3d (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  coordinates POINT, -- For GPS coordinates [lng, lat]
  scale DECIMAL DEFAULT 1.0,
  rotation_x DECIMAL DEFAULT 0,
  rotation_y DECIMAL DEFAULT 0,  
  rotation_z DECIMAL DEFAULT 0,
  elevation DECIMAL DEFAULT 0, -- meters above ground
  project_id UUID,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.model_3d ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for model_3d
CREATE POLICY "Anyone can view 3D models" 
ON public.model_3d 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create 3D models" 
ON public.model_3d 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own 3D models" 
ON public.model_3d 
FOR UPDATE 
USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own 3D models" 
ON public.model_3d 
FOR DELETE 
USING (auth.uid() = uploaded_by);

-- Add foreign key constraint for projects (optional)
ALTER TABLE public.model_3d 
ADD CONSTRAINT fk_model_3d_project 
FOREIGN KEY (project_id) REFERENCES public.projects(id) 
ON DELETE SET NULL;

-- Create trigger for updating timestamps
CREATE TRIGGER update_model_3d_updated_at
  BEFORE UPDATE ON public.model_3d
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tasks_updated_at();

-- Insert a sample 3D model entry (you can remove this after uploading real models)
INSERT INTO public.model_3d (
  name, 
  description, 
  file_url, 
  coordinates, 
  scale, 
  rotation_x, 
  elevation
) VALUES (
  'Sample House Model',
  'Default sample model for testing',
  'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
  POINT(145.032000, -37.820300),
  0.5,
  1.5708, -- 90 degrees in radians
  1.5
);