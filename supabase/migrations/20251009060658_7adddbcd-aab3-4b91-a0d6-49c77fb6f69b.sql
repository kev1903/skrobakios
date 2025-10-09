-- Create table for AI suggestions and alerts
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('alert', 'suggestion', 'insight', 'warning')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category TEXT NOT NULL CHECK (category IN ('budget', 'timeline', 'tasks', 'resources', 'risk', 'quality', 'general')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  action_items JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  dismissed BOOLEAN DEFAULT false,
  actioned BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_ai_suggestions_user_company ON public.ai_suggestions(user_id, company_id);
CREATE INDEX idx_ai_suggestions_project ON public.ai_suggestions(project_id);
CREATE INDEX idx_ai_suggestions_active ON public.ai_suggestions(dismissed, actioned, expires_at);

-- Enable RLS
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their company's AI suggestions"
  ON public.ai_suggestions
  FOR SELECT
  USING (
    company_id IN (
      SELECT cm.company_id 
      FROM public.company_members cm 
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Users can update their company's AI suggestions"
  ON public.ai_suggestions
  FOR UPDATE
  USING (
    company_id IN (
      SELECT cm.company_id 
      FROM public.company_members cm 
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Service role can insert AI suggestions"
  ON public.ai_suggestions
  FOR INSERT
  WITH CHECK (true);

-- Create function to clean up old dismissed suggestions
CREATE OR REPLACE FUNCTION public.cleanup_old_suggestions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.ai_suggestions
  WHERE (dismissed = true AND updated_at < now() - interval '7 days')
     OR (expires_at IS NOT NULL AND expires_at < now());
END;
$$;