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
      if (!projectId) return [];

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

      // If we have project members, return them
      if (members && members.length > 0) {
        return members as ProjectUser[];
      }

      // If no project members, fall back to company members for this project
      try {
        // Get the project to find its company
        const { data: project, error: projectError } = await supabase
          .from("projects")
          .select("company_id")
          .eq("id", projectId)
          .single();

        if (projectError || !project) {
          console.error("Error fetching project:", projectError);
          return [];
        }

        // Get company members - first get the members
        const { data: companyMembers, error: companyError } = await supabase
          .from("company_members")
          .select("id, user_id, role, status")
          .eq("company_id", project.company_id)
          .eq("status", "active")
          .order("joined_at", { ascending: false });

        if (companyError) {
          console.error("Error fetching company members:", companyError);
          return [];
        }

        if (!companyMembers || companyMembers.length === 0) {
          return [];
        }

        // Get user profiles separately
        const userIds = companyMembers
          .map(member => member.user_id)
          .filter(id => id !== null);

        if (userIds.length === 0) {
          return [];
        }

        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, email, first_name, last_name, avatar_url, professional_title, phone, skills")
          .in("user_id", userIds);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          return [];
        }

        // Map profiles by user_id for easier lookup
        const profileMap = new Map();
        (profiles || []).forEach(profile => {
          profileMap.set(profile.user_id, profile);
        });

        // Transform company members to match ProjectUser interface
        return companyMembers.map(member => {
          const profile = profileMap.get(member.user_id);
          return {
            id: member.id,
            user_id: member.user_id,
            email: profile?.email || null,
            role: member.role,
            status: member.status,
            profile: profile ? {
              first_name: profile.first_name,
              last_name: profile.last_name,
              avatar_url: profile.avatar_url,
              professional_title: profile.professional_title,
              phone: profile.phone,
              skills: profile.skills
            } : undefined
          };
        }) as ProjectUser[];

      } catch (error) {
        console.error("Error in fallback to company members:", error);
        return [];
      }
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