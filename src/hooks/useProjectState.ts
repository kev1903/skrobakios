
import { useState, useEffect, useRef } from 'react';
import { useProjects, Project } from "@/hooks/useProjects";
import { useCompany } from "@/contexts/CompanyContext";

export const useProjectState = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const { getProjects, getProject } = useProjects();
  const { currentCompany } = useCompany();
  const isInitializedRef = useRef(false);

  // Auto-select first project for the active company if none selected or company changed
  useEffect(() => {
    const autoSelectForCompany = async () => {
      if (!currentCompany?.id) return;
      // If no selection or we haven't auto-selected for this company, pick first project
      if (!selectedProject || !hasAutoSelected) {
        try {
          const projects = await getProjects();
          if (projects.length > 0) {
            console.log('Auto-selecting first project for company', currentCompany.id, projects[0].id);
            setSelectedProject(projects[0].id);
            setHasAutoSelected(true);
          } else {
            setSelectedProject(null);
            setCurrentProject(null);
            setHasAutoSelected(true);
          }
        } catch (error) {
          console.error('Error auto-selecting project for company:', error);
        }
      }
    };

    autoSelectForCompany();
    // Reset initialization on company switch
    isInitializedRef.current = true;
  }, [currentCompany?.id]);

  useEffect(() => {
    const fetchCurrentProject = async () => {
      if (selectedProject) {
        console.log('🔍 Fetching project with ID:', selectedProject);
        try {
          // Use getProject for individual project fetching which checks cache and company scope first
          const project = await getProject(selectedProject);
          console.log('🔍 getProject result:', project);
          if (project) {
            console.log('✅ Project found:', project.name);
            setCurrentProject(project);
          } else {
            console.log('❌ Project not found or not in current company, attempting to select first available');
            // Fallback: fetch projects for current company and select first
            const projects = await getProjects();
            if (projects.length > 0) {
              setSelectedProject(projects[0].id);
              setCurrentProject(projects[0] || null);
              setHasAutoSelected(true);
            } else {
              setCurrentProject(null);
            }
          }
        } catch (error) {
          console.error('❌ Error fetching projects:', error);
          setCurrentProject(null);
        }
      }
    };

    fetchCurrentProject();
  }, [selectedProject, getProjects, getProject]);

  const handleSelectProject = (projectId: string) => {
    console.log("Setting selected project:", projectId);
    setSelectedProject(projectId);
  };

  return {
    selectedProject,
    currentProject,
    handleSelectProject
  };
};
