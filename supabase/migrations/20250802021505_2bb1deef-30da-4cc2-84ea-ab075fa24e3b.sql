-- Create time_categories table to store user-defined categories
CREATE TABLE public.time_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id, name)
);

-- Enable Row Level Security
ALTER TABLE public.time_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for time_categories
CREATE POLICY "Users can view their own categories" 
ON public.time_categories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories" 
ON public.time_categories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" 
ON public.time_categories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" 
ON public.time_categories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_time_categories_updated_at
BEFORE UPDATE ON public.time_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories for existing users
INSERT INTO public.time_categories (user_id, company_id, name, color, is_default)
SELECT 
  p.user_id,
  cm.company_id,
  category.name,
  category.color,
  true
FROM profiles p
CROSS JOIN company_members cm ON p.user_id = cm.user_id AND cm.status = 'active'
CROSS JOIN (
  VALUES 
    ('Design', '217 91% 60%'),
    ('Admin', '159 61% 51%'),
    ('Calls', '43 96% 56%'),
    ('Break', '0 84% 60%'),
    ('Browsing', '263 69% 69%'),
    ('Site Visit', '188 94% 43%'),
    ('Deep Work', '160 84% 39%'),
    ('Other', '217 33% 47%')
) AS category(name, color)
ON CONFLICT (user_id, company_id, name) DO NOTHING;