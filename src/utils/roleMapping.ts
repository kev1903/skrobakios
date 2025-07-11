import type { UserRole } from '@/components/admin/types';

// Map database roles to display roles - simplified system
export const mapDatabaseRoleToDisplayRole = (dbRole: string): UserRole => {
  // All roles except superadmin map to 'user'
  switch (dbRole) {
    case 'superadmin':
      return 'superadmin';
    default:
      return 'user';
  }
};

export const mapDisplayRoleToDatabase = (newRole: UserRole): string => {
  return newRole; // Direct mapping since we simplified the roles
};