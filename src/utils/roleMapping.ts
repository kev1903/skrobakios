import type { UserRole } from '@/components/admin/types';
import type { DatabaseRole } from '@/types/accessUsers';

export const mapDatabaseRoleToDisplayRole = (dbRole: string): UserRole => {
  switch (dbRole) {
    case 'superadmin':
      return 'Super Admin';
    case 'project_manager':
      return 'Project Manager';
    case 'consultant':
      return 'Consultant';
    case 'subcontractor':
      return 'SubContractor';
    case 'accounts':
      return 'Accounts';
    case 'client_viewer':
      return 'Client Viewer';
    // Legacy role mappings - these should be migrated
    case 'project_admin':
    case 'admin':
      return 'Project Manager';
    case 'estimator':
    case 'user':
    default:
      return 'Client Viewer';
  }
};

export const mapDisplayRoleToDatabase = (newRole: UserRole): DatabaseRole['role'] => {
  switch (newRole) {
    case 'Super Admin':
      return 'superadmin';
    case 'Project Manager':
      return 'project_manager';
    case 'Consultant':
      return 'consultant';
    case 'SubContractor':
      return 'subcontractor';
    case 'Accounts':
      return 'accounts';
    case 'Client Viewer':
    default:
      return 'client_viewer';
  }
};