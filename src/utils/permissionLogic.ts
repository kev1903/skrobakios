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
    case 1: // Company Admin - full access to all company permissions
      return [
        'manage_company_settings',
        'manage_company_billing',
        'manage_projects',
        'manage_finance',
        'manage_sales',
        'manage_dashboard',
        'manage_digital_twin',
        'manage_cost_contracts',
        'manage_schedule',
        'manage_tasks',
        'manage_files',
        'manage_team',
        'manage_digital_objects',
      ];
    default:
      return [];
  }
};