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
        'manage_company_settings',
        'view_all_projects',
        'manage_projects',
        'view_project_analytics',
      ];
    case 1: // Company Admin - company management and specific permissions
      return [
        'view_all_companies',
        'create_companies',
        'manage_company_settings',
        'manage_company_billing',
        'manage_estimates',
        'manage_invoicing',
      ];
    default:
      return [];
  }
};