
import { useState, useEffect } from 'react';
import { useProjects, Project } from "@/hooks/useProjects";

export const useProjectState = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const { getProjects, getProject } = useProjects();

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
