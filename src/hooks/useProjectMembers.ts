
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProjectMember {
  name: string;
  avatar: string;
  role: string;
  email: string;
}

export const useProjectMembers = (projectId?: string) => {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjectMembers = async () => {
      if (!projectId) {
        setMembers([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('project_id', projectId)
          .eq('status', 'active');

        if (error) throw error;

        const formattedMembers = (data || []).map(member => ({
          name: member.name || member.email,
          avatar: member.avatar_url || '',
          role: member.role,
          email: member.email
        }));

        setMembers(formattedMembers);
      } catch (error) {
        console.error('Error fetching project members:', error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectMembers();
  }, [projectId]);

  return { members, loading };
};
