-- Create takeoffs table for storing estimate take-off measurements
CREATE TABLE public.takeoffs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Area', 'Linear', 'Number', 'Volume')),
  quantity TEXT DEFAULT '0',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'complete')),
  unit TEXT NOT NULL,
  measurements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.takeoffs ENABLE ROW LEVEL SECURITY;

-- Create policies for takeoffs
CREATE POLICY "Users can view their estimate takeoffs" 
ON public.takeoffs 
FOR SELECT 
USING (
  estimate_id IN (
    SELECT id FROM estimates 
    WHERE created_by = auth.uid() OR last_modified_by = auth.uid()
  )
);

CREATE POLICY "Users can create takeoffs for their estimates" 
ON public.takeoffs 
FOR INSERT 
WITH CHECK (
  estimate_id IN (
    SELECT id FROM estimates 
    WHERE created_by = auth.uid() OR last_modified_by = auth.uid()
  )
);

CREATE POLICY "Users can update their estimate takeoffs" 
ON public.takeoffs 
FOR UPDATE 
USING (
  estimate_id IN (
    SELECT id FROM estimates 
    WHERE created_by = auth.uid() OR last_modified_by = auth.uid()
  )
);

CREATE POLICY "Users can delete their estimate takeoffs" 
ON public.takeoffs 
FOR DELETE 
USING (
  estimate_id IN (
    SELECT id FROM estimates 
    WHERE created_by = auth.uid() OR last_modified_by = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_takeoffs_updated_at
BEFORE UPDATE ON public.takeoffs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();