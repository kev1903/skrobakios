
import { useState, useEffect } from 'react';
import { useProjects, Project } from "@/hooks/useProjects";

export const useProjectState = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const { getProjects } = useProjects();

  useEffect(() => {
    const fetchCurrentProject = async () => {
      if (selectedProject) {
        try {
          const projects = await getProjects();
          const project = projects.find(p => p.id === selectedProject);
          if (project) {
            setCurrentProject(project);
          } else {
            // No project found
            setCurrentProject(null);
          }
        } catch (error) {
          console.error('Error fetching projects:', error);
          // Set to null on error
          setCurrentProject(null);
        }
      }
    };

    fetchCurrentProject();
  }, [selectedProject, getProjects]);

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
