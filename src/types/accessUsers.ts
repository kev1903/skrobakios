export interface DatabaseProfile {
  id: string;
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  company: string | null;
  status: string;
}

// Enhanced role system to match the hierarchical structure with multiple roles support
export interface DatabaseRole {
  user_id: string;
  role: 'superadmin' | 'owner' | 'admin' | 'user';
}

// Enhanced access user types with hierarchical roles - supports multiple roles
export interface AccessUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company?: string;
  phone?: string;
  avatar_url?: string;
  role: 'superadmin' | 'owner' | 'admin' | 'user'; // Primary role (highest priority)
  roles: ('superadmin' | 'owner' | 'admin' | 'user')[]; // All roles
  status: 'Active' | 'Invited' | 'Inactive';
  created_at: string;
  updated_at: string;
}