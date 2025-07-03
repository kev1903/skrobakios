import { supabase } from '@/integrations/supabase/client';
import type { DatabaseRole } from '@/types/accessUsers';

export interface PermissionSection {
  id: string;
  name: string;
  enabled: boolean;
}

export interface RolePermissions {
  company: PermissionSection[];
  project: PermissionSection[];
}

export interface RoleData {
  id: string;
  name: string;
  description: string;
  permissions: RolePermissions;
  userCount: number;
  system: boolean;
}

// Define available company and project permissions
const companyPermissions = [
  { id: 'user_management', name: 'User Management' },
  { id: 'role_management', name: 'Role Management' },
  { id: 'system_settings', name: 'System Settings' },
  { id: 'financial_management', name: 'Financial Management' },
  { id: 'invoice_management', name: 'Invoice Management' },
  { id: 'expense_tracking', name: 'Expense Tracking' },
  { id: 'company_settings', name: 'Company Settings' },
  { id: 'admin_panel', name: 'Admin Panel Access' }
];

const projectPermissions = [
  { id: 'project_management', name: 'Project Management' },
  { id: 'project_create', name: 'Create Projects' },
  { id: 'project_edit', name: 'Edit Projects' },
  { id: 'project_delete', name: 'Delete Projects' },
  { id: 'project_view', name: 'View Projects' },
  { id: 'team_management', name: 'Team Management' },
  { id: 'task_management', name: 'Task Management' },
  { id: 'task_view', name: 'View Tasks' },
  { id: 'file_access', name: 'File Access' },
  { id: 'file_upload', name: 'File Upload' },
  { id: 'progress_view', name: 'Progress Tracking' },
  { id: 'estimation_tools', name: 'Estimation Tools' },
  { id: 'schedule_management', name: 'Schedule Management' }
];

// Helper function to create permission structure
const createPermissions = (enabledCompany: string[], enabledProject: string[]): RolePermissions => ({
  company: companyPermissions.map(perm => ({
    ...perm,
    enabled: enabledCompany.includes(perm.id)
  })),
  project: projectPermissions.map(perm => ({
    ...perm,
    enabled: enabledProject.includes(perm.id)
  }))
});

// Role descriptions and permissions mapping
const roleConfig = {
  superadmin: {
    name: 'Super Admin',
    description: 'Full system access with all administrative privileges',
    permissions: createPermissions(
      // Enable ALL company permissions
      companyPermissions.map(p => p.id),
      // Enable ALL project permissions  
      projectPermissions.map(p => p.id)
    ),
    system: true
  },
  project_manager: {
    name: 'Project Manager',
    description: 'Manage projects, teams, and project-related activities',
    permissions: createPermissions(
      ['expense_tracking'],
      ['project_management', 'project_create', 'project_edit', 'project_view', 'team_management', 'task_management', 'task_view', 'file_access', 'file_upload', 'progress_view', 'schedule_management']
    ),
    system: false
  },
  project_admin: {
    name: 'Project Admin',
    description: 'Administrative access to project settings and team management',
    permissions: createPermissions(
      [],
      ['project_edit', 'project_view', 'team_management', 'task_management', 'task_view', 'file_access', 'progress_view']
    ),
    system: false
  },
  consultant: {
    name: 'Consultant',
    description: 'External consultant with limited project access',
    permissions: createPermissions(
      [],
      ['project_view', 'task_view', 'file_access', 'progress_view']
    ),
    system: false
  },
  subcontractor: {
    name: 'SubContractor',
    description: 'External contractor with specific task access',
    permissions: createPermissions(
      [],
      ['task_management', 'task_view', 'file_access', 'file_upload', 'progress_view']
    ),
    system: false
  },
  estimator: {
    name: 'Estimator',
    description: 'Access to cost estimation and financial planning tools',
    permissions: createPermissions(
      ['expense_tracking'],
      ['project_view', 'estimation_tools', 'progress_view']
    ),
    system: false
  },
  accounts: {
    name: 'Accounts',
    description: 'Financial and accounting access',
    permissions: createPermissions(
      ['financial_management', 'invoice_management', 'expense_tracking'],
      ['project_view', 'progress_view']
    ),
    system: false
  },
  admin: {
    name: 'Admin',
    description: 'General administrative access (legacy role)',
    permissions: createPermissions(
      ['company_settings'],
      ['project_management', 'project_view', 'team_management', 'task_management', 'task_view']
    ),
    system: false
  },
  user: {
    name: 'User',
    description: 'Basic user access with limited permissions',
    permissions: createPermissions(
      [],
      ['project_view', 'task_view']
    ),
    system: false
  },
  client_viewer: {
    name: 'Client Viewer',
    description: 'Limited read-only access for clients',
    permissions: createPermissions(
      [],
      ['project_view', 'progress_view']
    ),
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