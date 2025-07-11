-- Enable real-time for digital_objects table
ALTER TABLE public.digital_objects REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.digital_objects;