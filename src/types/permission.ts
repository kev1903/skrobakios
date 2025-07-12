export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface Role {
  id: string;
  name: string;
  color: string;
  level: number;
}

export interface PermissionMatrixProps {
  permissions?: Permission[];
  roles?: Role[];
  onPermissionChange?: (roleId: string, permissionId: string, granted: boolean) => void;
}