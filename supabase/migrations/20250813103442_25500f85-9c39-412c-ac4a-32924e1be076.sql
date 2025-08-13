-- Enhanced contract management schema

-- Update project_contracts table to support comprehensive contract data
ALTER TABLE project_contracts ADD COLUMN IF NOT EXISTS ai_summary_json JSONB DEFAULT '{}';
ALTER TABLE project_contracts ADD COLUMN IF NOT EXISTS confidence NUMERIC DEFAULT 0;
ALTER TABLE project_contracts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE project_contracts ADD COLUMN IF NOT EXISTS contract_data JSONB DEFAULT '{}';
ALTER TABLE project_contracts ADD COLUMN IF NOT EXISTS is_canonical BOOLEAN DEFAULT true;

-- Create contract_versions table for version management
CREATE TABLE IF NOT EXISTS contract_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES project_contracts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  ai_summary_json JSONB DEFAULT '{}',
  confidence NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'processing',
  is_canonical BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  processing_metadata JSONB DEFAULT '{}'
);

-- Create contract_milestones table
CREATE TABLE IF NOT EXISTS contract_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES project_contracts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  due_date DATE,
  amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contract_risks table  
CREATE TABLE IF NOT EXISTS contract_risks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES project_contracts(id) ON DELETE CASCADE,
  risk_description TEXT NOT NULL,
  risk_level TEXT NOT NULL DEFAULT 'medium', -- low, medium, high
  mitigation_strategy TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contract_actions table
CREATE TABLE IF NOT EXISTS contract_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES project_contracts(id) ON DELETE CASCADE,
  action_description TEXT NOT NULL,
  due_date DATE,
  completed BOOLEAN DEFAULT false,
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE contract_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_actions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contract_versions
CREATE POLICY "Users can view contract versions they have access to" ON contract_versions
  FOR SELECT USING (
    contract_id IN (
      SELECT pc.id FROM project_contracts pc
      WHERE pc.project_id IN (
        SELECT p.id FROM projects p
        JOIN company_members cm ON p.company_id = cm.company_id
        WHERE cm.user_id = auth.uid() AND cm.status = 'active'
      )
    )
  );

CREATE POLICY "Users can create contract versions they have access to" ON contract_versions
  FOR INSERT WITH CHECK (
    contract_id IN (
      SELECT pc.id FROM project_contracts pc
      WHERE pc.project_id IN (
        SELECT p.id FROM projects p
        JOIN company_members cm ON p.company_id = cm.company_id
        WHERE cm.user_id = auth.uid() AND cm.status = 'active'
      )
    )
  );

CREATE POLICY "Users can update contract versions they have access to" ON contract_versions
  FOR UPDATE USING (
    contract_id IN (
      SELECT pc.id FROM project_contracts pc
      WHERE pc.project_id IN (
        SELECT p.id FROM projects p
        JOIN company_members cm ON p.company_id = cm.company_id
        WHERE cm.user_id = auth.uid() AND cm.status = 'active'
      )
    )
  );

-- Create RLS policies for other tables (similar pattern)
CREATE POLICY "Users can manage contract milestones" ON contract_milestones
  FOR ALL USING (
    contract_id IN (
      SELECT pc.id FROM project_contracts pc
      WHERE pc.project_id IN (
        SELECT p.id FROM projects p
        JOIN company_members cm ON p.company_id = cm.company_id
        WHERE cm.user_id = auth.uid() AND cm.status = 'active'
      )
    )
  );

CREATE POLICY "Users can manage contract risks" ON contract_risks
  FOR ALL USING (
    contract_id IN (
      SELECT pc.id FROM project_contracts pc
      WHERE pc.project_id IN (
        SELECT p.id FROM projects p
        JOIN company_members cm ON p.company_id = cm.company_id
        WHERE cm.user_id = auth.uid() AND cm.status = 'active'
      )
    )
  );

CREATE POLICY "Users can manage contract actions" ON contract_actions
  FOR ALL USING (
    contract_id IN (
      SELECT pc.id FROM project_contracts pc
      WHERE pc.project_id IN (
        SELECT p.id FROM projects p
        JOIN company_members cm ON p.company_id = cm.company_id
        WHERE cm.user_id = auth.uid() AND cm.status = 'active'
      )
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contract_versions_contract_id ON contract_versions(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_versions_is_canonical ON contract_versions(contract_id, is_canonical);
CREATE INDEX IF NOT EXISTS idx_contract_milestones_contract_id ON contract_milestones(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_risks_contract_id ON contract_risks(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_actions_contract_id ON contract_actions(contract_id);