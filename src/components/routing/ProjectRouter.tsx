
import { ProjectDetail } from "@/components/ProjectDetail";
import { ProjectTasksPage } from "@/components/ProjectTasksPage";
import { ProjectFilePage } from "@/components/ProjectFilePage";
import { ProjectSettingsPage } from "@/components/ProjectSettingsPage";
import { ProjectSchedulePage } from "@/components/ProjectSchedulePage";
import { ProjectTeamPage } from "@/components/ProjectTeamPage";
import { ProjectBIMPage } from "@/components/ProjectBIMPage";
import { GanttChartPage } from "@/components/GanttChartPage";
import { Project } from "@/hooks/useProjects";

interface ProjectRouterProps {
  currentPage: string;
  selectedProject: string | null;
  getCurrentProject: () => Project;
  onNavigate: (page: string) => void;
}

export const ProjectRouter = ({ 
  currentPage, 
  selectedProject, 
  getCurrentProject, 
  onNavigate 
}: ProjectRouterProps) => {
  const projectRoutes: Record<string, JSX.Element> = {
    "project-detail": <ProjectDetail projectId={selectedProject} onNavigate={onNavigate} />,
    "project-tasks": <ProjectTasksPage project={getCurrentProject()} onNavigate={onNavigate} />,
    "project-files": <ProjectFilePage project={getCurrentProject()} onNavigate={onNavigate} />,
    "project-settings": <ProjectSettingsPage project={getCurrentProject()} onNavigate={onNavigate} />,
    "project-schedule": <ProjectSchedulePage project={getCurrentProject()} onNavigate={onNavigate} />,
    "project-team": <ProjectTeamPage project={getCurrentProject()} onNavigate={onNavigate} />,
    "project-bim": <ProjectBIMPage project={getCurrentProject()} onNavigate={onNavigate} />,
    "gantt-chart": <GanttChartPage project={getCurrentProject()} onNavigate={onNavigate} />
  };

  return projectRoutes[currentPage] || null;
};
