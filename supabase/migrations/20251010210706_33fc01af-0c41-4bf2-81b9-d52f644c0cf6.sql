-- Create Task_Submittals table
CREATE TABLE IF NOT EXISTS public.task_submittals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  submittal_name TEXT NOT NULL,
  submittal_type TEXT,
  file_url TEXT,
  file_size BIGINT,
  submitted_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  description TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Task_Reviews table
CREATE TABLE IF NOT EXISTS public.task_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submittal_id UUID NOT NULL REFERENCES public.task_submittals(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id),
  review_status TEXT NOT NULL DEFAULT 'pending',
  review_comments TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Task_QA table
CREATE TABLE IF NOT EXISTS public.task_qa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  qa_type TEXT NOT NULL,
  checklist_item TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  checked_by UUID REFERENCES auth.users(id),
  checked_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Task_Costs table
CREATE TABLE IF NOT EXISTS public.task_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  cost_type TEXT NOT NULL,
  estimated_cost NUMERIC DEFAULT 0,
  actual_cost NUMERIC DEFAULT 0,
  impact_level TEXT,
  cost_description TEXT,
  justification TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_submittals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_qa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_costs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_submittals
CREATE POLICY "Users can view submittals for tasks in their companies"
ON public.task_submittals FOR SELECT
USING (
  task_id IN (
    SELECT t.id FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can create submittals for tasks in their companies"
ON public.task_submittals FOR INSERT
WITH CHECK (
  task_id IN (
    SELECT t.id FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can update submittals for tasks in their companies"
ON public.task_submittals FOR UPDATE
USING (
  task_id IN (
    SELECT t.id FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- RLS Policies for task_reviews
CREATE POLICY "Users can view reviews for tasks in their companies"
ON public.task_reviews FOR SELECT
USING (
  task_id IN (
    SELECT t.id FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can create reviews for tasks in their companies"
ON public.task_reviews FOR INSERT
WITH CHECK (
  task_id IN (
    SELECT t.id FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can update reviews for tasks in their companies"
ON public.task_reviews FOR UPDATE
USING (
  task_id IN (
    SELECT t.id FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- RLS Policies for task_qa
CREATE POLICY "Users can manage QA for tasks in their companies"
ON public.task_qa FOR ALL
USING (
  task_id IN (
    SELECT t.id FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- RLS Policies for task_costs
CREATE POLICY "Users can manage costs for tasks in their companies"
ON public.task_costs FOR ALL
USING (
  task_id IN (
    SELECT t.id FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);