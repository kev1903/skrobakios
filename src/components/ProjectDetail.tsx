
import { useState, useEffect } from "react";
import { useProjects, Project } from "@/hooks/useProjects";
import { ProjectSidebar } from "./ProjectSidebar";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectInfo } from "./ProjectInfo";
import { ProjectProgress } from "./ProjectProgress";
import { ProjectMetrics } from "./ProjectMetrics";
import { LatestUpdates } from "./LatestUpdates";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface ProjectDetailProps {
  projectId: string | null;
  onNavigate: (page: string) => void;
}

export const ProjectDetail = ({ projectId, onNavigate }: ProjectDetailProps) => {
  const [project, setProject] = useState<Project | null>(null);
  const { getProjects, loading } = useProjects();

  useEffect(() => {
    const fetchProject = async () => {
      const projects = await getProjects();
      const foundProject = projects.find(p => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  // Fallback project data if no project is found
  const fallbackProject: Project = {
    id: "1",
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
  };

  const currentProject = project || fallbackProject;

  const handleProjectUpdate = (updatedProject: Project) => {
    setProject(updatedProject);
  };

  const getProgress = (status: string) => {
    switch (status) {
      case "completed":
        return 100;
      case "running":
        return 65;
      case "pending":
        return 0;
      default:
        return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "running":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "running":
        return "In Progress";
      case "pending":
        return "Pending";
      default:
        return "Active";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const progress = getProgress(currentProject.status);
  const wbsCount = Math.floor(Math.random() * 10) + 8; // Random WBS count for demo

  if (loading) {
    return (
      <div className="h-screen flex bg-gray-50">
        <div className="flex items-center justify-center w-full">
          <div className="text-gray-500">Loading project details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={currentProject}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Schedule Button */}
          <div className="mb-6">
            <Button 
              onClick={() => onNavigate("project-schedule")}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule</span>
            </Button>
          </div>

          <ProjectHeader
            project={currentProject}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            onProjectUpdate={handleProjectUpdate}
          />

          <ProjectInfo
            project={currentProject}
            getStatusText={getStatusText}
            formatDate={formatDate}
          />

          <ProjectProgress progress={progress} wbsCount={wbsCount} />

          <ProjectMetrics project={currentProject} />

          <LatestUpdates
            project={currentProject}
            progress={progress}
            wbsCount={wbsCount}
          />
        </div>
      </div>
    </div>
  );
};
