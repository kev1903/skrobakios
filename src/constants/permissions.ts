import { Permission, Role } from '@/types/permission';

export const defaultPermissions: Permission[] = [
  // Platform Administration
  { id: 'manage_platform_users', name: 'Manage Platform Users', description: 'Create, edit, and delete platform users', category: 'Platform Administration' },
  { id: 'manage_platform_roles', name: 'Manage Platform Roles', description: 'Assign and modify platform-level roles', category: 'Platform Administration' },
  { id: 'view_platform_analytics', name: 'View Platform Analytics', description: 'Access platform-wide usage and performance data', category: 'Platform Administration' },
  { id: 'manage_system_settings', name: 'Manage System Settings', description: 'Configure global platform settings', category: 'Platform Administration' },
  
  // Company Management
  { id: 'view_all_companies', name: 'View All Companies', description: 'Access information for all companies on platform', category: 'Company Management' },
  { id: 'create_companies', name: 'Create Companies', description: 'Create new company accounts', category: 'Company Management' },
  { id: 'manage_company_settings', name: 'Manage Company Settings', description: 'Modify company configurations and modules', category: 'Company Management' },
  { id: 'manage_company_billing', name: 'Manage Company Billing', description: 'Handle billing and subscription management', category: 'Company Management' },
  
  // Project & Task Management
  { id: 'view_all_projects', name: 'View All Projects', description: 'Access projects across all companies', category: 'Project & Task Management' },
  { id: 'manage_projects', name: 'Manage Projects', description: 'Create, edit, and delete projects', category: 'Project & Task Management' },
  { id: 'manage_tasks', name: 'Manage Tasks', description: 'Create, assign, and manage tasks', category: 'Project & Task Management' },
  { id: 'view_project_analytics', name: 'View Project Analytics', description: 'Access project performance and progress data', category: 'Project & Task Management' },
  
  // Financial Management
  { id: 'view_financial_reports', name: 'View Financial Reports', description: 'Access financial reports and data', category: 'Financial Management' },
  { id: 'manage_estimates', name: 'Manage Estimates', description: 'Create and manage project estimates', category: 'Financial Management' },
  { id: 'manage_invoicing', name: 'Manage Invoicing', description: 'Handle invoice creation and management', category: 'Financial Management' },
  { id: 'manage_integrations', name: 'Manage Integrations', description: 'Configure third-party integrations (Xero, etc)', category: 'Financial Management' },
  
  // Lead & Sales Management
  { id: 'view_all_leads', name: 'View All Leads', description: 'Access leads across all companies', category: 'Lead & Sales Management' },
  { id: 'manage_leads', name: 'Manage Leads', description: 'Create, edit, and manage leads', category: 'Lead & Sales Management' },
  { id: 'view_sales_analytics', name: 'View Sales Analytics', description: 'Access sales performance and conversion data', category: 'Lead & Sales Management' },
  
  // Digital Twin & 3D Models
  { id: 'view_all_models', name: 'View All 3D Models', description: 'Access 3D models across all projects', category: 'Digital Twin & 3D Models' },
  { id: 'manage_digital_objects', name: 'Manage Digital Objects', description: 'Create and manage digital twin objects', category: 'Digital Twin & 3D Models' },
  { id: 'upload_3d_models', name: 'Upload 3D Models', description: 'Upload and manage 3D model files', category: 'Digital Twin & 3D Models' },
];

export const defaultRoles: Role[] = [
  { id: 'superadmin', name: 'Super Admin', color: 'destructive', level: 3 },
  { id: 'platform_admin', name: 'Platform Admin', color: 'default', level: 2 },
  { id: 'company_admin', name: 'Company Admin', color: 'secondary', level: 1 },
];