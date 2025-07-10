export type UserRole = 
  | 'Super Admin'
  | 'Project Manager'
  | 'Consultant'
  | 'SubContractor'
  | 'Accounts'
  | 'Client Viewer';

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
  'Super Admin',
  'Project Manager',
  'Consultant',
  'SubContractor',
  'Accounts',
  'Client Viewer',
];