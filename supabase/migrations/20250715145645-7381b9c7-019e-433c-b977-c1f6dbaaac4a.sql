-- Create AI chat logs table for audit purposes
CREATE TABLE public.ai_chat_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('user_query', 'ai_response')),
  context JSONB DEFAULT '{}',
  response_length INTEGER NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_chat_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own chat logs" 
ON public.ai_chat_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat logs" 
ON public.ai_chat_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_chat_logs_updated_at
BEFORE UPDATE ON public.ai_chat_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();