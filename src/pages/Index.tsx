import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ContentRenderer } from "@/components/layout/ContentRenderer";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Project } from "@/hooks/useProjects";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  
  // Get current page from URL, default to 'home' for authenticated users or 'auth' for others
  // Project BIM pages will handle their own auth check based on database settings
  const currentPage = searchParams.get('page') || (user ? 'home' : 'auth');
  
  // Get projectId from URL if present
  const projectIdFromUrl = searchParams.get('projectId');

  const handleNavigate = useCallback((page: string) => {
    console.log('🔄 Navigation requested:', page);
    
    // Parse the page string for query parameters
    const [pageName, queryString] = page.split('?');
    
    // Create new search params
    const newParams = new URLSearchParams();
    newParams.set('page', pageName);
    
    // If there's a query string, parse and add those parameters
    if (queryString) {
      const queryParams = new URLSearchParams(queryString);
      queryParams.forEach((value, key) => {
        newParams.set(key, value);
      });
    }
    
    console.log('✅ Navigating to:', `/?${newParams.toString()}`);
    setSearchParams(newParams);
  }, [setSearchParams]);

  // Update selected project when URL changes
  useEffect(() => {
    if (projectIdFromUrl) {
      setSelectedProject(projectIdFromUrl);
    }
  }, [projectIdFromUrl]);

  // Fetch current project details when selectedProject changes
  useEffect(() => {
    if (!selectedProject) {
      setCurrentProject(null);
      return;
    }

    const fetchProject = async () => {
      console.log('🔍 INDEX: Fetching project:', selectedProject, 'User:', !!user);
      
      // For public BIM access, we don't require authentication
      // The RLS policies allow public read access to projects with allow_public_bim_access = true
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', selectedProject)
        .single();

      if (!error && data) {
        console.log('✅ INDEX: Project fetched successfully:', {
          id: data.id,
          name: data.name,
          allow_public_bim_access: data.allow_public_bim_access
        });
        setCurrentProject(data as unknown as Project);
      } else {
        console.error('❌ INDEX: Error fetching project:', error);
        
        // If fetch failed and user is not authenticated, show auth page
        if (!user) {
          console.error('❌ INDEX: Project fetch failed for unauthenticated user, redirecting to auth');
          handleNavigate('auth');
        }
      }
    };

    fetchProject();
  }, [selectedProject, user, handleNavigate]);

  const handleSelectProject = (projectId: string) => {
    console.log('🔄 Project selected:', projectId);
    setSelectedProject(projectId);
    
    // Also update URL with projectId if not navigating away
    const currentParams = new URLSearchParams(searchParams);
    currentParams.set('projectId', projectId);
    setSearchParams(currentParams);
  };

  return (
    <PageLayout 
      currentPage={currentPage} 
      onNavigate={handleNavigate}
      disableSpacing={currentPage === 'project-bim'}
    >
      <ContentRenderer
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onSelectProject={handleSelectProject}
        selectedProject={selectedProject}
        currentProject={currentProject}
      />
    </PageLayout>
  );
};

export default Index;
