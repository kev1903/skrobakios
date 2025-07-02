
import { useState, useEffect } from 'react';
import { useProjects, Project } from "@/hooks/useProjects";

export const useProjectState = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const { getProjects } = useProjects();

  useEffect(() => {
    const fetchCurrentProject = async () => {
      if (selectedProject) {
        const projects = await getProjects();
        const project = projects.find(p => p.id === selectedProject);
        if (project) {
          setCurrentProject(project);
        } else {
          // Fallback project for demo purposes
          setCurrentProject({
            id: "550e8400-e29b-41d4-a716-446655440000",
            project_id: "SK23003",
            name: "Gordon Street, Balwyn",
            location: "Balwyn, VIC",
            created_at: "2024-06-15T00:00:00Z",
            status: "completed",
            contract_price: "$2,450,000",
            start_date: "2024-06-15",
            deadline: "2024-08-30",
            updated_at: "2024-06-15T00:00:00Z",
            priority: "Medium"
          });
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
