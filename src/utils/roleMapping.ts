import type { UserRole } from '@/components/admin/AccessManagementTable';
import type { DatabaseRole } from '@/types/accessUsers';

export const mapDatabaseRoleToDisplayRole = (dbRole: string): UserRole => {
  switch (dbRole) {
    case 'superadmin':
      return 'Super Admin';
    case 'project_manager':
      return 'Project Manager';
    case 'project_admin':
      return 'Project Admin';
    case 'consultant':
      return 'Consultant';
    case 'subcontractor':
      return 'SubContractor';
    case 'estimator':
      return 'Estimator';
    case 'accounts':
      return 'Accounts';
    case 'admin':
      return 'Project Manager';
    case 'user':
    case 'client_viewer':
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
    case 'Project Admin':
      return 'project_admin';
    case 'Consultant':
      return 'consultant';
    case 'SubContractor':
      return 'subcontractor';
    case 'Estimator':
      return 'estimator';
    case 'Accounts':
      return 'accounts';
    case 'Client Viewer':
    default:
      return 'client_viewer';
  }
};