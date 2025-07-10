export type UserRole = 
  | 'superadmin'
  | 'admin'
  | 'user'
  | 'project_manager'
  | 'project_admin'
  | 'consultant'
  | 'subcontractor'
  | 'estimator'
  | 'accounts'
  | 'client_viewer';

export type UserStatus = 'Active' | 'Suspended' | 'Invited';

export interface AccessUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
}

export interface AccessManagementTableProps {
  users: AccessUser[];
  currentUserRole?: UserRole;
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onStatusChange: (userId: string, newStatus: UserStatus) => void;
  onViewUser: (userId: string) => void;
  onEditUser: (userId: string) => void;
  onRemoveUser: (userId: string) => void;
  onReactivateUser: (userId: string) => void;
  onAddNewUser: () => void;
}

export const ROLES: UserRole[] = [
  'superadmin',
  'admin',
  'user',
  'project_manager',
  'project_admin',
  'consultant',
  'subcontractor',
  'estimator',
  'accounts',
  'client_viewer',
];

// Role display names for UI
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  'superadmin': 'Super Admin',
  'admin': 'Admin',
  'user': 'User',
  'project_manager': 'Project Manager',
  'project_admin': 'Project Admin',
  'consultant': 'Consultant',
  'subcontractor': 'Subcontractor',
  'estimator': 'Estimator',
  'accounts': 'Accounts',
  'client_viewer': 'Client Viewer',
};