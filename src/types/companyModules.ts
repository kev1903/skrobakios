export interface CompanyModule {
  id: string;
  company_id: string;
  module_name: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Define available modules
export const AVAILABLE_MODULES = [
  // Company Modules
  { key: 'projects', name: 'Projects', description: 'Project management and tracking' },
  { key: 'finance', name: 'Finance', description: 'Financial management and accounting' },
  { key: 'sales', name: 'Sales', description: 'Sales management and CRM' },
  
  // Project Modules
  { key: 'dashboard', name: 'Dashboard', description: 'Project overview and metrics' },
  { key: 'team', name: 'Team', description: 'Team member management and collaboration' }
];