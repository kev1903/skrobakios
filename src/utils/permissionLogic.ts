import { defaultPermissions } from '@/constants/permissions';

// Enhanced RBAC permission assignments based on role hierarchy
export const getDefaultPermissions = (role: string): string[] => {
  const allPermissions = defaultPermissions.map(p => p.id);
  const platformPermissions = defaultPermissions.filter(p => p.category === 'Platform Permissions').map(p => p.id);
  const companyPermissions = defaultPermissions.filter(p => p.category === 'Company Permissions').map(p => p.id);
  
  switch (role) {
    case 'superadmin': // Super Admin - full platform control
      return allPermissions;
      
    case 'business_admin': // Business Admin - full company access + limited platform visibility
      return [
        ...companyPermissions, // Full access to all company modules
        'view_project_analytics', // Can view project analytics for their companies
      ];
      
    case 'project_admin': // Project Admin - limited company access
      return [
        'projects',
        'schedule',
        'tasks',
        'files',
        'team',
        'dashboard',
      ];
      
    case 'user': // Regular User - basic access
      return [
        'dashboard',
        'tasks',
        'files',
      ];
      
    case 'client': // Client - minimal read-only access
      return [
        'dashboard',
      ];
      
    default:
      return ['dashboard']; // Fallback minimum permission
  }
};

// Role level mapping for hierarchy checks
export const getRoleLevel = (role: string): number => {
  const roleLevels = {
    superadmin: 5,
    business_admin: 4,
    project_admin: 3,
    user: 2,
    client: 1,
  };
  return roleLevels[role as keyof typeof roleLevels] || 0;
};

// Check if a role can manage another role
export const canManageRole = (managerRole: string, targetRole: string): boolean => {
  const managerLevel = getRoleLevel(managerRole);
  const targetLevel = getRoleLevel(targetRole);
  
  // Superadmins can manage all except other superadmins (for safety)
  if (managerRole === 'superadmin') {
    return targetRole !== 'superadmin';
  }
  
  // Business admins can manage project_admin, user, and client roles
  if (managerRole === 'business_admin') {
    return ['project_admin', 'user', 'client'].includes(targetRole);
  }
  
  // Project admins can manage users and clients
  if (managerRole === 'project_admin') {
    return ['user', 'client'].includes(targetRole);
  }
  
  return false;
};