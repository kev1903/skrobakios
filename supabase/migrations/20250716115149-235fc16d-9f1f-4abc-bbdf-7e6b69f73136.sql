-- Create project network nodes table
CREATE TABLE public.project_network_nodes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_name text NOT NULL,
  description text,
  duration_days numeric NOT NULL DEFAULT 0,
  progress_percentage numeric NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  status text NOT NULL DEFAULT 'pending',
  position_x numeric NOT NULL DEFAULT 0,
  position_y numeric NOT NULL DEFAULT 0,
  position_z numeric NOT NULL DEFAULT 0,
  node_type text NOT NULL DEFAULT 'task',
  color text NOT NULL DEFAULT '#3b82f6',
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create project network dependencies table
CREATE TABLE public.project_network_dependencies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  predecessor_node_id uuid NOT NULL REFERENCES public.project_network_nodes(id) ON DELETE CASCADE,
  successor_node_id uuid NOT NULL REFERENCES public.project_network_nodes(id) ON DELETE CASCADE,
  dependency_type text NOT NULL DEFAULT 'FS', -- FS, SS, FF, SF
  lag_days numeric NOT NULL DEFAULT 0,
  criticality numeric NOT NULL DEFAULT 1 CHECK (criticality >= 0 AND criticality <= 1),
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(predecessor_node_id, successor_node_id)
);

-- Create project network AI state table
CREATE TABLE public.project_network_ai_state (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  ai_suggestions jsonb DEFAULT '[]',
  simulation_state jsonb DEFAULT '{}',
  optimization_history jsonb DEFAULT '[]',
  last_ai_update timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);

-- Enable RLS on all tables
ALTER TABLE public.project_network_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_network_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_network_ai_state ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project network nodes
CREATE POLICY "Users can view nodes in their company projects" 
ON public.project_network_nodes 
FOR SELECT 
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can create nodes in their company projects" 
ON public.project_network_nodes 
FOR INSERT 
WITH CHECK (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can update nodes in their company projects" 
ON public.project_network_nodes 
FOR UPDATE 
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can delete nodes in their company projects" 
ON public.project_network_nodes 
FOR DELETE 
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- Create RLS policies for project network dependencies
CREATE POLICY "Users can view dependencies in their company projects" 
ON public.project_network_dependencies 
FOR SELECT 
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can create dependencies in their company projects" 
ON public.project_network_dependencies 
FOR INSERT 
WITH CHECK (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can update dependencies in their company projects" 
ON public.project_network_dependencies 
FOR UPDATE 
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can delete dependencies in their company projects" 
ON public.project_network_dependencies 
FOR DELETE 
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- Create RLS policies for project network AI state
CREATE POLICY "Users can view AI state in their company projects" 
ON public.project_network_ai_state 
FOR SELECT 
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can manage AI state in their company projects" 
ON public.project_network_ai_state 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- Create indexes for performance
CREATE INDEX idx_project_network_nodes_project_id ON public.project_network_nodes(project_id);
CREATE INDEX idx_project_network_dependencies_project_id ON public.project_network_dependencies(project_id);
CREATE INDEX idx_project_network_dependencies_nodes ON public.project_network_dependencies(predecessor_node_id, successor_node_id);
CREATE INDEX idx_project_network_ai_state_project_id ON public.project_network_ai_state(project_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_project_network_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE TRIGGER update_project_network_nodes_updated_at
  BEFORE UPDATE ON public.project_network_nodes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_project_network_updated_at();

CREATE TRIGGER update_project_network_dependencies_updated_at
  BEFORE UPDATE ON public.project_network_dependencies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_project_network_updated_at();

CREATE TRIGGER update_project_network_ai_state_updated_at
  BEFORE UPDATE ON public.project_network_ai_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_project_network_updated_at();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_network_nodes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_network_dependencies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_network_ai_state;