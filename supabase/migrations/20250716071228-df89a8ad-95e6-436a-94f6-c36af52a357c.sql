-- Enable real-time for sk_25008_design table
ALTER TABLE public.sk_25008_design REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sk_25008_design;

-- Enable real-time for tasks table  
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;