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
  { key: 'digital-twin', name: 'Digital Twin', description: '3D models and digital representations' },
  { key: 'cost-contracts', name: 'Cost & Contracts', description: 'Cost tracking and contract management' },
  { key: 'schedule', name: 'Schedule', description: 'Project scheduling and timeline management' },
  { key: 'tasks', name: 'Tasks', description: 'Task management and assignment' },
  { key: 'files', name: 'Files', description: 'Document and file management' },
  { key: 'team', name: 'Team', description: 'Team member management and collaboration' },
  { key: 'digital-objects', name: 'Digital Objects', description: 'Digital asset management' }
];