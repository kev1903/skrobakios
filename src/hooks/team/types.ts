
export interface TeamMember {
  id: string;
  email: string;
  name?: string;
  role: 'project_admin' | 'editor' | 'viewer' | 'guest';
  status: string;
  invited_at: string;
  joined_at?: string;
  notify_on_task_added?: boolean;
  avatar_url?: string;
}

export interface ProjectAccessSettings {
  access_level: 'private_to_members' | 'public' | 'restricted';
  allow_member_invites: boolean;
  require_approval_for_join: boolean;
}
