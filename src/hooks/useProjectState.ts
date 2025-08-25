
import { useState, useEffect, useRef } from 'react';
import { useProjects, Project } from "@/hooks/useProjects";

export const useProjectState = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const { getProjects, getProject } = useProjects();
  const isInitializedRef = useRef(false);

  // Auto-select first project if none is selected
  useEffect(() => {
    const autoSelectFirstProject = async () => {
      if (!selectedProject && !hasAutoSelected && !isInitializedRef.current) {
        isInitializedRef.current = true;
        try {
          const projects = await getProjects();
          if (projects.length > 0) {
            console.log('Auto-selecting first project:', projects[0].id);
            setSelectedProject(projects[0].id);
            setHasAutoSelected(true);
          }
        } catch (error) {
          console.error('Error auto-selecting project:', error);
          isInitializedRef.current = false; // Reset on error
        }
      }
    };

    autoSelectFirstProject();
  }, []); // Remove dependencies to prevent infinite loops

  useEffect(() => {
    const fetchCurrentProject = async () => {
      if (selectedProject) {
        console.log('🔍 Fetching project with ID:', selectedProject);
        try {
          // Use getProject for individual project fetching which checks cache first
          const project = await getProject(selectedProject);
          console.log('🔍 getProject result:', project);
          if (project) {
            console.log('✅ Project found:', project.name);
            setCurrentProject(project);
          } else {
            console.log('❌ Project not found with getProject, trying getProjects fallback');
            // Fallback to fetching all projects if individual fetch fails
            const projects = await getProjects();
            console.log('🔍 Available projects:', projects.length, projects.map(p => ({ id: p.id, name: p.name })));
            const foundProject = projects.find(p => p.id === selectedProject);
            console.log('🔍 Found project in list:', foundProject ? foundProject.name : 'Not found');
            setCurrentProject(foundProject || null);
          }
        } catch (error) {
          console.error('❌ Error fetching projects:', error);
          setCurrentProject(null);
        }
      }
    };

    fetchCurrentProject();
  }, [selectedProject]); // Only depend on selectedProject to prevent loops

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
