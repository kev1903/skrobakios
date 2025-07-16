-- Enable realtime for sk_25008_design table
ALTER TABLE public.sk_25008_design REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sk_25008_design;

-- Enable realtime for tasks table
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;