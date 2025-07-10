import type { UserRole } from '@/components/admin/types';
import type { DatabaseRole } from '@/types/accessUsers';

export const mapDatabaseRoleToDisplayRole = (dbRole: string): UserRole => {
  switch (dbRole) {
    case 'superadmin':
      return 'superadmin';
    case 'admin':
      return 'admin';
    case 'user':
      return 'user';
    case 'project_manager':
      return 'project_manager';
    case 'project_admin':
      return 'project_admin';
    case 'consultant':
      return 'consultant';
    case 'subcontractor':
      return 'subcontractor';
    case 'estimator':
      return 'estimator';
    case 'accounts':
      return 'accounts';
    case 'client_viewer':
      return 'client_viewer';
    default:
      return 'user';
  }
};

export const mapDisplayRoleToDatabase = (newRole: UserRole): DatabaseRole['role'] => {
  return newRole; // Now they're the same, no mapping needed
};