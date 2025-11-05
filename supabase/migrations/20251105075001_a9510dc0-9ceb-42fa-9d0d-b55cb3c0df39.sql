-- Create schedule sections table
CREATE TABLE public.schedule_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES public.project_schedules(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create schedule items table
CREATE TABLE public.schedule_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES public.schedule_sections(id) ON DELETE CASCADE,
  product_code TEXT,
  product_name TEXT,
  width TEXT,
  length TEXT,
  height TEXT,
  depth TEXT,
  qty TEXT,
  lead_time TEXT,
  brand TEXT,
  color TEXT,
  finish TEXT,
  material TEXT,
  supplier TEXT,
  status TEXT DEFAULT 'Draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.schedule_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_items ENABLE ROW LEVEL SECURITY;

-- Policies for schedule_sections
CREATE POLICY "Users can view schedule sections"
  ON public.schedule_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_schedules
      WHERE project_schedules.id = schedule_sections.schedule_id
      AND (project_schedules.created_by = auth.uid() OR project_schedules.is_public = true)
    )
  );

CREATE POLICY "Users can create schedule sections"
  ON public.schedule_sections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_schedules
      WHERE project_schedules.id = schedule_sections.schedule_id
      AND project_schedules.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update schedule sections"
  ON public.schedule_sections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.project_schedules
      WHERE project_schedules.id = schedule_sections.schedule_id
      AND project_schedules.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete schedule sections"
  ON public.schedule_sections FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.project_schedules
      WHERE project_schedules.id = schedule_sections.schedule_id
      AND project_schedules.created_by = auth.uid()
    )
  );

-- Policies for schedule_items
CREATE POLICY "Users can view schedule items"
  ON public.schedule_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.schedule_sections
      JOIN public.project_schedules ON project_schedules.id = schedule_sections.schedule_id
      WHERE schedule_sections.id = schedule_items.section_id
      AND (project_schedules.created_by = auth.uid() OR project_schedules.is_public = true)
    )
  );

CREATE POLICY "Users can create schedule items"
  ON public.schedule_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.schedule_sections
      JOIN public.project_schedules ON project_schedules.id = schedule_sections.schedule_id
      WHERE schedule_sections.id = schedule_items.section_id
      AND project_schedules.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update schedule items"
  ON public.schedule_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.schedule_sections
      JOIN public.project_schedules ON project_schedules.id = schedule_sections.schedule_id
      WHERE schedule_sections.id = schedule_items.section_id
      AND project_schedules.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete schedule items"
  ON public.schedule_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.schedule_sections
      JOIN public.project_schedules ON project_schedules.id = schedule_sections.schedule_id
      WHERE schedule_sections.id = schedule_items.section_id
      AND project_schedules.created_by = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_schedule_sections_schedule_id ON public.schedule_sections(schedule_id);
CREATE INDEX idx_schedule_items_section_id ON public.schedule_items(section_id);

-- Create triggers for updated_at
CREATE TRIGGER update_schedule_sections_updated_at
  BEFORE UPDATE ON public.schedule_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedule_items_updated_at
  BEFORE UPDATE ON public.schedule_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();