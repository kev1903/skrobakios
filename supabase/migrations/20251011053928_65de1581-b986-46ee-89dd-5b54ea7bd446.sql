-- Create knowledge types enum
CREATE TYPE knowledge_type AS ENUM ('business', 'industry', 'project');

-- Create skai_knowledge table
CREATE TABLE public.skai_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  knowledge_type knowledge_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_skai_knowledge_type ON public.skai_knowledge(knowledge_type);
CREATE INDEX idx_skai_knowledge_company ON public.skai_knowledge(company_id);
CREATE INDEX idx_skai_knowledge_active ON public.skai_knowledge(is_active);

-- Enable RLS
ALTER TABLE public.skai_knowledge ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Company members can view knowledge for their company
CREATE POLICY "Company members can view knowledge"
ON public.skai_knowledge FOR SELECT
USING (
  company_id IN (
    SELECT cm.company_id 
    FROM public.company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- Company admins can manage knowledge
CREATE POLICY "Company admins can manage knowledge"
ON public.skai_knowledge FOR ALL
USING (
  company_id IN (
    SELECT cm.company_id 
    FROM public.company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.role IN ('owner', 'admin') 
    AND cm.status = 'active'
  )
);

-- Superadmins can manage all knowledge
CREATE POLICY "Superadmins can manage all knowledge"
ON public.skai_knowledge FOR ALL
USING (is_superadmin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_skai_knowledge_updated_at
BEFORE UPDATE ON public.skai_knowledge
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to update updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;