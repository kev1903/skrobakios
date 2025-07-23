import { Permission, Role } from '@/types/permission';

export const defaultPermissions: Permission[] = [
  // Platform Permissions
  { id: 'manage_platform_users', name: 'Manage Platform Users', description: 'Create, edit, and delete platform users', category: 'Platform Permissions' },
  { id: 'manage_platform_roles', name: 'Manage Platform Roles', description: 'Assign and modify platform-level roles', category: 'Platform Permissions' },
  { id: 'view_platform_analytics', name: 'View Platform Analytics', description: 'Access platform-wide usage and performance data', category: 'Platform Permissions' },
  { id: 'manage_system_settings', name: 'Manage System Settings', description: 'Configure global platform settings', category: 'Platform Permissions' },
  { id: 'view_all_companies', name: 'View All Companies', description: 'Access information for all companies on platform', category: 'Platform Permissions' },
  { id: 'create_companies', name: 'Create Companies', description: 'Create new company accounts', category: 'Platform Permissions' },
  { id: 'view_all_projects', name: 'View All Projects', description: 'Access projects across all companies', category: 'Platform Permissions' },
  { id: 'view_project_analytics', name: 'View Project Analytics', description: 'Access project performance and progress data', category: 'Platform Permissions' },
  
  // Company Permissions
  { id: 'manage_company_settings', name: 'Manage Company Settings', description: 'Modify company configurations and modules', category: 'Company Permissions' },
  { id: 'manage_company_billing', name: 'Manage Company Billing', description: 'Handle billing and subscription management', category: 'Company Permissions' },
  { id: 'projects', name: 'Projects Module', description: 'Access and manage the projects module', category: 'Company Permissions' },
  { id: 'finance', name: 'Finance Module', description: 'Access and manage the finance module', category: 'Company Permissions' },
  { id: 'sales', name: 'Sales Module', description: 'Access and manage the sales module', category: 'Company Permissions' },
  { id: 'dashboard', name: 'Dashboard Module', description: 'Access and manage the dashboard module', category: 'Company Permissions' },
  { id: 'digital-twin', name: 'Digital Twin Module', description: 'Access and manage the digital-twin module', category: 'Company Permissions' },
  { id: 'cost-contracts', name: 'Cost Contracts Module', description: 'Access and manage the cost-contracts module', category: 'Company Permissions' },
  { id: 'schedule', name: 'Schedule Module', description: 'Access and manage the schedule module', category: 'Company Permissions' },
  { id: 'tasks', name: 'Tasks Module', description: 'Access and manage the tasks module', category: 'Company Permissions' },
  { id: 'files', name: 'Files Module', description: 'Access and manage the files module', category: 'Company Permissions' },
  { id: 'team', name: 'Team Module', description: 'Access and manage the team module', category: 'Company Permissions' },
  { id: 'digital-objects', name: 'Digital Objects Module', description: 'Access and manage the digital-objects module', category: 'Company Permissions' },
];

export const defaultRoles: Role[] = [
  { id: 'superadmin', name: 'Super Admin', color: 'destructive', level: 5 },
  { id: 'business_admin', name: 'Business Admin', color: 'default', level: 4 },
  { id: 'project_admin', name: 'Project Admin', color: 'secondary', level: 3 },
  { id: 'user', name: 'User', color: 'outline', level: 2 },
  { id: 'client', name: 'Client', color: 'outline', level: 1 },
];