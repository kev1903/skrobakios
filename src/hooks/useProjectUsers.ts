import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProjectUser {
  id: string;
  user_id: string | null;
  email: string | null;
  role: string;
  status: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    professional_title?: string;
    phone?: string;
    skills?: string[];
  };
}

export const useProjectUsers = (projectId: string) => {
  return useQuery({
    queryKey: ["project-users", projectId],
    queryFn: async () => {
      // First get project members
      const { data: members, error: membersError } = await supabase
        .from("project_members")
        .select(`
          *,
          profiles!project_members_user_id_fkey (
            first_name,
            last_name,
            avatar_url,
            professional_title,
            phone,
            skills
          )
        `)
        .eq("project_id", projectId)
        .eq("status", "active")
        .order("joined_at", { ascending: false });

      if (membersError) {
        console.error("Error fetching project users:", membersError);
        throw membersError;
      }

      return (members || []) as ProjectUser[];
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useProjectUserByName = (projectId: string, userName: string) => {
  const { data: users } = useProjectUsers(projectId);
  
  if (!users || !userName) return null;
  
  return users.find(user => {
    if (!user.profile) return false;
    const fullName = `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.trim();
    return fullName.toLowerCase() === userName.toLowerCase();
  });
};

export const formatUserName = (user: ProjectUser) => {
  if (user.profile?.first_name || user.profile?.last_name) {
    return `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.trim();
  }
  return user.email || 'Unknown User';
};

export const getUserInitials = (user: ProjectUser) => {
  const name = formatUserName(user);
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getUserAvatar = (user: ProjectUser) => {
  return user.profile?.avatar_url || '';
};