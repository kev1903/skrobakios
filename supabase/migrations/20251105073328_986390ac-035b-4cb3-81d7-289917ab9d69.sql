-- Create project_schedules table
CREATE TABLE IF NOT EXISTS public.project_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled schedule',
  type TEXT NOT NULL DEFAULT 'Schedule',
  status TEXT,
  shared_with TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for project_schedules
CREATE POLICY "Users can view schedules in their projects"
  ON public.project_schedules
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE company_id IN (
        SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create schedules in their projects"
  ON public.project_schedules
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE company_id IN (
        SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update schedules in their projects"
  ON public.project_schedules
  FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE company_id IN (
        SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete schedules in their projects"
  ON public.project_schedules
  FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE company_id IN (
        SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Create index for faster queries
CREATE INDEX idx_project_schedules_project_id ON public.project_schedules(project_id);
CREATE INDEX idx_project_schedules_created_by ON public.project_schedules(created_by);

-- Create updated_at trigger
CREATE TRIGGER update_project_schedules_updated_at
  BEFORE UPDATE ON public.project_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();