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

export interface DatabaseRole {
  user_id: string;
  role: 'superadmin' | 'project_manager' | 'consultant' | 'subcontractor' | 'accounts' | 'client_viewer';
}