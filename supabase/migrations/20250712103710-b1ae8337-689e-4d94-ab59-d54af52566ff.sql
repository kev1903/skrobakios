-- Insert superadmin role for the current user to test role switching
INSERT INTO public.user_roles (user_id, role)
VALUES (auth.uid(), 'superadmin')
ON CONFLICT (user_id, role) DO NOTHING;