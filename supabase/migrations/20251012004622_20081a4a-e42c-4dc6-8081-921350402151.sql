-- Create chat_messages table with company-level isolation for critical privacy
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  context JSONB DEFAULT '{}'::jsonb,
  image_data TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_company 
  ON public.chat_messages(user_id, company_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation 
  ON public.chat_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_company_created 
  ON public.chat_messages(company_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view chat messages from companies they belong to
CREATE POLICY "Users can view chat messages from their companies" 
ON public.chat_messages 
FOR SELECT 
USING (
  company_id IN (
    SELECT cm.company_id 
    FROM public.company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- RLS Policy: Users can insert messages only for themselves and their companies
CREATE POLICY "Users can insert messages for their companies" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid()
  AND company_id IN (
    SELECT cm.company_id 
    FROM public.company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- RLS Policy: Users can update their own messages
CREATE POLICY "Users can update their own messages" 
ON public.chat_messages 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users can delete their own messages
CREATE POLICY "Users can delete their own messages" 
ON public.chat_messages 
FOR DELETE 
USING (user_id = auth.uid());

-- Create function to automatically set updated_at
CREATE OR REPLACE FUNCTION public.update_chat_messages_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_chat_messages_updated_at
  BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chat_messages_updated_at();

-- Add comment for documentation
COMMENT ON TABLE public.chat_messages IS 'Stores AI chat messages with company-level isolation for privacy. Each message is associated with a user and company, ensuring data separation between businesses.';