import { UserRole } from '@/hooks/useUserRole';

export interface HierarchicalUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  phone?: string;
  company?: string;
  app_role: UserRole;
  company_role: string;
  status: string;
  created_at: string;
  can_manage_roles: boolean;
  can_assign_to_companies: boolean;
}

export interface CompanyAssignment {
  user_id: string;
  company_id: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'invited' | 'inactive';
}

export interface PlatformUserManagementProps {
  onUserSelect?: (user: HierarchicalUser) => void;
  onCompanyAssign?: (userId: string, companyId: string) => void;
}

export interface CompanyUserManagementProps {
  companyId: string;
  onUserUpdate?: (user: HierarchicalUser) => void;
}