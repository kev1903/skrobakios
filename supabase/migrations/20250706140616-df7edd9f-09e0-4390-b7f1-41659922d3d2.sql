-- Create table for storing map configurations
CREATE TABLE IF NOT EXISTS public.map_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'default',
  center_lng DECIMAL NOT NULL,
  center_lat DECIMAL NOT NULL,
  zoom DECIMAL NOT NULL,
  pitch DECIMAL DEFAULT 0,
  bearing DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.map_configurations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read map configurations (since it's for the homepage)
CREATE POLICY "Map configurations are viewable by everyone" 
ON public.map_configurations 
FOR SELECT 
USING (true);

-- Create policy to allow authenticated users to insert/update map configurations
CREATE POLICY "Authenticated users can manage map configurations" 
ON public.map_configurations 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_map_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_map_configurations_updated_at
BEFORE UPDATE ON public.map_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_map_configurations_updated_at();

-- Insert default configuration (current Melbourne position)
INSERT INTO public.map_configurations (name, center_lng, center_lat, zoom, pitch, bearing, is_active)
VALUES ('default', 144.9631, -37.8136, 6.5, 30, 0, true);