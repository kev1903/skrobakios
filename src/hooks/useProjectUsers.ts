import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProjectUser {
  id: string;
  user_id: string | null;
  email: string | null;
  role: string;
  status: string;
  isCurrentUser?: boolean;
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
      if (!projectId) return [];

      // Get current user to mark them in the list
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const currentUserId = currentUser?.id;

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
        console.error("Error fetching project members:", membersError);
      }

      // If we have project members, return them with current user marked
      if (members && members.length > 0) {
        const projectUsers = members.map(member => ({
          ...member,
          isCurrentUser: member.user_id === currentUserId
        })) as ProjectUser[];
        
        // Sort to put current user first
        return projectUsers.sort((a, b) => {
          if (a.isCurrentUser && !b.isCurrentUser) return -1;
          if (!a.isCurrentUser && b.isCurrentUser) return 1;
          return 0;
        });
      }

      // No project members found - return empty array
      return [];
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

// Hook to get current user data for task assignment
export const useCurrentUserForAssignment = (projectId: string) => {
  const { data: users } = useProjectUsers(projectId);
  
  const currentUser = users?.find(user => user.isCurrentUser);
  
  if (!currentUser) return null;
  
  return {
    name: formatUserName(currentUser),
    avatar: getUserAvatar(currentUser),
    userId: currentUser.user_id || currentUser.id
  };
};