import { useState, useEffect } from "react";
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
  // BUT allow public BIM pages without authentication
  const isPublicBimPage = searchParams.get('page') === 'project-bim' && searchParams.get('public') === 'true';
  const currentPage = searchParams.get('page') || (user ? 'home' : (isPublicBimPage ? 'project-bim' : 'auth'));
  
  // Get projectId from URL if present
  const projectIdFromUrl = searchParams.get('projectId');

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
      // For public BIM access, we don't require authentication
      // The RLS policies will need to allow public read access to projects table
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', selectedProject)
        .single();

      if (!error && data) {
        setCurrentProject(data as unknown as Project);
      } else {
        console.error('Error fetching project:', error);
      }
    };

    fetchProject();
  }, [selectedProject]);

  const handleNavigate = (page: string) => {
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
  };

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
