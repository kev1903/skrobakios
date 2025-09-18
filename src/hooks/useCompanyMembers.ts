import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CompanyMember {
  id: string;
  user_id: string | null;
  role: string;
  status: string;
  email?: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    professional_title?: string;
    phone?: string;
    skills?: string[];
  };
}

export const useCompanyMembers = (companyId: string) => {
  return useQuery({
    queryKey: ["company-members", companyId],
    queryFn: async () => {
      if (!companyId) return [];

      // Get company members
      const { data: companyMembers, error: companyError } = await supabase
        .from("company_members")
        .select("id, user_id, role, status")
        .eq("company_id", companyId)
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

      // Transform company members
      const members = companyMembers.map(member => {
        const profile = profileMap.get(member.user_id);
        return {
          id: member.id,
          user_id: member.user_id,
          role: member.role,
          status: member.status,
          email: profile?.email,
          profile: profile ? {
            first_name: profile.first_name,
            last_name: profile.last_name,
            avatar_url: profile.avatar_url,
            professional_title: profile.professional_title,
            phone: profile.phone,
            skills: profile.skills
          } : undefined
        };
      }) as CompanyMember[];

      return members;
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const formatMemberName = (member: CompanyMember) => {
  if (member.profile?.first_name || member.profile?.last_name) {
    return `${member.profile.first_name || ''} ${member.profile.last_name || ''}`.trim();
  }
  return member.email || 'Unknown User';
};

export const getMemberInitials = (member: CompanyMember) => {
  const name = formatMemberName(member);
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};