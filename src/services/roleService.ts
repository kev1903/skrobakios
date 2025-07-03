import { supabase } from '@/integrations/supabase/client';
import type { DatabaseRole } from '@/types/accessUsers';

export interface RoleData {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  system: boolean;
}

// Role descriptions and permissions mapping
const roleConfig = {
  superadmin: {
    name: 'Super Admin',
    description: 'Full system access with all administrative privileges',
    permissions: ['user_management', 'role_management', 'system_settings', 'project_management', 'financial_access'],
    system: true
  },
  project_manager: {
    name: 'Project Manager',
    description: 'Manage projects, teams, and project-related activities',
    permissions: ['project_management', 'team_management', 'task_management', 'file_access'],
    system: false
  },
  project_admin: {
    name: 'Project Admin',
    description: 'Administrative access to project settings and team management',
    permissions: ['project_settings', 'team_management', 'task_management'],
    system: false
  },
  consultant: {
    name: 'Consultant',
    description: 'External consultant with limited project access',
    permissions: ['task_view', 'file_view', 'project_view'],
    system: false
  },
  subcontractor: {
    name: 'SubContractor',
    description: 'External contractor with specific task access',
    permissions: ['task_management', 'file_access'],
    system: false
  },
  estimator: {
    name: 'Estimator',
    description: 'Access to cost estimation and financial planning tools',
    permissions: ['estimation_tools', 'financial_view', 'project_view'],
    system: false
  },
  accounts: {
    name: 'Accounts',
    description: 'Financial and accounting access',
    permissions: ['financial_management', 'invoice_management', 'expense_tracking'],
    system: false
  },
  admin: {
    name: 'Admin',
    description: 'General administrative access (legacy role)',
    permissions: ['project_management', 'team_management', 'task_management'],
    system: false
  },
  user: {
    name: 'User',
    description: 'Basic user access with limited permissions',
    permissions: ['task_view', 'project_view'],
    system: false
  },
  client_viewer: {
    name: 'Client Viewer',
    description: 'Limited read-only access for clients',
    permissions: ['project_view', 'progress_view'],
    system: false
  }
};

export const fetchRoleData = async (): Promise<RoleData[]> => {
  try {
    // Fetch role counts from the database
    const { data: roleCounts, error: roleError } = await supabase
      .from('user_roles')
      .select('role');

    if (roleError) throw roleError;

    // Count users for each role
    const roleCountMap = new Map<string, number>();
    (roleCounts as DatabaseRole[]).forEach(userRole => {
      const currentCount = roleCountMap.get(userRole.role) || 0;
      roleCountMap.set(userRole.role, currentCount + 1);
    });

    // Create role data array from all available roles in the enum
    const availableRoles = Object.keys(roleConfig) as Array<keyof typeof roleConfig>;
    
    const rolesData: RoleData[] = availableRoles.map(roleKey => {
      const config = roleConfig[roleKey];
      return {
        id: roleKey,
        name: config.name,
        description: config.description,
        permissions: config.permissions,
        userCount: roleCountMap.get(roleKey) || 0,
        system: config.system
      };
    });

    // Sort roles: system roles first, then by user count descending
    return rolesData.sort((a, b) => {
      if (a.system && !b.system) return -1;
      if (!a.system && b.system) return 1;
      return b.userCount - a.userCount;
    });

  } catch (error) {
    console.error('Error fetching role data:', error);
    throw error;
  }
};

export const getRoleStats = async () => {
  try {
    const roles = await fetchRoleData();
    
    return {
      totalRoles: roles.length,
      totalUsers: roles.reduce((sum, role) => sum + role.userCount, 0),
      customRoles: roles.filter(role => !role.system).length,
      systemRoles: roles.filter(role => role.system).length
    };
  } catch (error) {
    console.error('Error fetching role stats:', error);
    throw error;
  }
};