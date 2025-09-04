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
        'projects',
      ];
    case 1: // Company Admin - full access to all company permissions
      return [
        'manage_company_settings',
        'manage_company_billing',
        'projects',
        'finance',
        'sales',
        'dashboard',
        
        'cost-contracts',
        'schedule',
        'tasks',
        'files',
        'team',
        
      ];
    default:
      return [];
  }
};