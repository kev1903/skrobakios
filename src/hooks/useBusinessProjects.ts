import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project } from './useProjects';
import { convertDbRowToProject } from '@/utils/projectTypeConverter';

interface BusinessProjects {
  [companyId: string]: Project[];
}

export const useBusinessProjects = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProjectsForBusinesses = useCallback(async (companyIds: string[]): Promise<BusinessProjects> => {
    if (companyIds.length === 0) return {};

    setLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Get user's company memberships to ensure they can access these companies
      const { data: membershipData, error: membershipError } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.user.id)
        .eq('status', 'active')
        .in('company_id', companyIds);

      if (membershipError) throw membershipError;

      const accessibleCompanyIds = membershipData?.map(m => m.company_id) || [];

      // Only fetch projects for companies the user has access to
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .in('company_id', accessibleCompanyIds)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Group projects by company_id
      const businessProjects: BusinessProjects = {};
      
      // Initialize all companies with empty arrays
      accessibleCompanyIds.forEach(companyId => {
        businessProjects[companyId] = [];
      });

      // Populate with actual projects
      (projectsData || []).forEach(projectRow => {
        const project = convertDbRowToProject(projectRow);
        if (!businessProjects[project.company_id]) {
          businessProjects[project.company_id] = [];
        }
        businessProjects[project.company_id].push(project);
      });

      return businessProjects;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch business projects';
      setError(errorMessage);
      console.error('Error fetching business projects:', err);
      return {};
    } finally {
      setLoading(false);
    }
  }, []);

  const getProjectsForBusiness = useCallback(async (companyId: string): Promise<Project[]> => {
    const businessProjects = await getProjectsForBusinesses([companyId]);
    return businessProjects[companyId] || [];
  }, [getProjectsForBusinesses]);

  return {
    getProjectsForBusinesses,
    getProjectsForBusiness,
    loading,
    error
  };
};