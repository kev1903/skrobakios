import { defaultPermissions } from '@/constants/permissions';

// Default permission assignments based on the three-tier role hierarchy
export const getDefaultPermissions = (roleLevel: number): string[] => {
  const allPermissions = defaultPermissions.map(p => p.id);
  
  switch (roleLevel) {
    case 3: // Super Admin - access to everything
      return allPermissions;
    case 2: // Platform Admin - selective permissions for platform departments (customizable via checkboxes)
      return [
        'view_platform_analytics',
        'view_all_companies',
        'view_all_projects',
        'view_project_analytics',
        'manage_company_settings',
        'manage_projects',
      ];
    case 1: // Company Admin - company permissions only
      return [
        'manage_company_settings',
        'manage_company_billing',
        'manage_projects',
        'manage_tasks',
        'view_financial_reports',
        'manage_estimates',
        'manage_invoicing',
        'manage_integrations',
      ];
    default:
      return [];
  }
};