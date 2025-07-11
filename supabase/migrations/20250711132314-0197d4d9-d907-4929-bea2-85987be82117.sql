-- Create simple user signup trigger without roles
CREATE OR REPLACE FUNCTION public.handle_simple_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create a simple active profile
  INSERT INTO public.profiles (user_id, first_name, last_name, email, status)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email,
    'active'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for simple user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_simple_user_signup();