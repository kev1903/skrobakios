-- Enable realtime for sk_25008_design table only (tasks already enabled)
ALTER TABLE public.sk_25008_design REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sk_25008_design;