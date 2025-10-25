-- Create project_owners table
CREATE TABLE IF NOT EXISTS public.project_owners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  suburb TEXT,
  state TEXT,
  postcode TEXT,
  abn TEXT,
  acn TEXT,
  work_phone TEXT,
  home_phone TEXT,
  mobile TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.project_owners ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_owners (simplified - accessible to authenticated users)
CREATE POLICY "Authenticated users can view all project owners"
  ON public.project_owners FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert project owners"
  ON public.project_owners FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update project owners"
  ON public.project_owners FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete project owners"
  ON public.project_owners FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Create updated_at trigger
CREATE TRIGGER update_project_owners_updated_at
  BEFORE UPDATE ON public.project_owners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();