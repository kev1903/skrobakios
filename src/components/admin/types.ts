// Simplified role system - only superadmin and user
export type UserRole = 'superadmin' | 'user';

export const ROLES: UserRole[] = ['superadmin', 'user'];

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  superadmin: 'Super Administrator',
  user: 'User'
};

export type UserStatus = 'Active' | 'Invited' | 'Inactive';

export interface AccessUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  status: UserStatus;
  company?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}