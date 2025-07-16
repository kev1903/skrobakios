-- Create Skai memory table for persistent context and history
CREATE TABLE public.skai_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_id uuid NOT NULL,
  project_id uuid,
  conversation_context jsonb DEFAULT '{}'::jsonb,
  action_history jsonb DEFAULT '[]'::jsonb,
  learned_patterns jsonb DEFAULT '{}'::jsonb,
  user_preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.skai_memory ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own Skai memory"
ON public.skai_memory
FOR ALL
USING (
  user_id = auth.uid() AND
  company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
)
WITH CHECK (
  user_id = auth.uid() AND
  company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_skai_memory_updated_at
BEFORE UPDATE ON public.skai_memory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create action execution log table
CREATE TABLE public.skai_action_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_id uuid NOT NULL,
  project_id uuid,
  action_type text NOT NULL,
  action_description text NOT NULL,
  command_data jsonb NOT NULL,
  execution_result jsonb,
  execution_time_ms integer,
  success boolean DEFAULT false,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for action log
ALTER TABLE public.skai_action_log ENABLE ROW LEVEL SECURITY;

-- Create policy for action log
CREATE POLICY "Users can view their own Skai action logs"
ON public.skai_action_log
FOR SELECT
USING (
  user_id = auth.uid() AND
  company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "System can insert action logs"
ON public.skai_action_log
FOR INSERT
WITH CHECK (true);