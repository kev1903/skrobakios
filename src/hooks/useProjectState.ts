
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from "react-router-dom";
import { useProjects, Project } from "@/hooks/useProjects";

export const useProjectState = () => {
  const [searchParams] = useSearchParams();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const { getProjects, getProject } = useProjects();
  const isInitializedRef = useRef(false);

  // Check URL parameters for projectId first
  useEffect(() => {
    const projectIdFromUrl = searchParams.get('projectId');
    if (projectIdFromUrl && projectIdFromUrl !== selectedProject) {
      console.log('Setting project from URL:', projectIdFromUrl);
      setSelectedProject(projectIdFromUrl);
      return; // Don't auto-select if we have URL parameter
    }
  }, [searchParams, selectedProject]);

  // Auto-select first project if none is selected and no URL parameter
  useEffect(() => {
    const autoSelectFirstProject = async () => {
      const projectIdFromUrl = searchParams.get('projectId');
      if (!selectedProject && !hasAutoSelected && !isInitializedRef.current && !projectIdFromUrl) {
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
  }, [searchParams, selectedProject, hasAutoSelected]); // Add dependencies to properly track state

  useEffect(() => {
    const fetchCurrentProject = async () => {
      if (selectedProject) {
        try {
          // Use getProject for individual project fetching which checks cache first
          const project = await getProject(selectedProject);
          if (project) {
            setCurrentProject(project);
          } else {
            // Fallback to fetching all projects if individual fetch fails
            const projects = await getProjects();
            const foundProject = projects.find(p => p.id === selectedProject);
            setCurrentProject(foundProject || null);
          }
        } catch (error) {
          console.error('Error fetching projects:', error);
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
