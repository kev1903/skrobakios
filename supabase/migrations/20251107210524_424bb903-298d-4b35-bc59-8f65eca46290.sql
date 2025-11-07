-- Create table for comment mentions
CREATE TABLE IF NOT EXISTS public.comment_mentions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.ifc_comments(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, mentioned_user_id)
);

-- Enable RLS
ALTER TABLE public.comment_mentions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comment_mentions
CREATE POLICY "Users can view mentions in their company projects"
  ON public.comment_mentions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ifc_comments ic
      JOIN public.company_members cm ON cm.company_id = ic.company_id
      JOIN public.profiles p ON p.user_id = cm.user_id
      WHERE ic.id = comment_mentions.comment_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create mentions"
  ON public.comment_mentions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ifc_comments ic
      JOIN public.company_members cm ON cm.company_id = ic.company_id
      JOIN public.profiles p ON p.user_id = cm.user_id
      WHERE ic.id = comment_mentions.comment_id
      AND p.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_comment_mentions_comment_id ON public.comment_mentions(comment_id);
CREATE INDEX idx_comment_mentions_mentioned_user_id ON public.comment_mentions(mentioned_user_id);