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
  { id: 'manage_projects', name: 'Manage Projects', description: 'Create, edit, and delete projects', category: 'Company Permissions' },
  { id: 'manage_tasks', name: 'Manage Tasks', description: 'Create, assign, and manage tasks', category: 'Company Permissions' },
  { id: 'view_financial_reports', name: 'View Financial Reports', description: 'Access financial reports and data', category: 'Company Permissions' },
  { id: 'manage_estimates', name: 'Manage Estimates', description: 'Create and manage project estimates', category: 'Company Permissions' },
  { id: 'manage_invoicing', name: 'Manage Invoicing', description: 'Handle invoice creation and management', category: 'Company Permissions' },
  { id: 'manage_integrations', name: 'Manage Integrations', description: 'Configure third-party integrations (Xero, etc)', category: 'Company Permissions' },
];

export const defaultRoles: Role[] = [
  { id: 'superadmin', name: 'Super Admin', color: 'destructive', level: 3 },
  { id: 'platform_admin', name: 'Platform Admin', color: 'default', level: 2 },
  { id: 'company_admin', name: 'Company Admin', color: 'secondary', level: 1 },
];