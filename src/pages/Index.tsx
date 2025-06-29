
import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TaskManagement } from "@/components/TaskManagement";
import { ProjectDashboard } from "@/components/ProjectDashboard";
import { ProjectDetail } from "@/components/ProjectDetail";
import { ProjectFilePage } from "@/components/ProjectFilePage";
import { ProjectSettingsPage } from "@/components/ProjectSettingsPage";
import { UploadProject } from "@/components/UploadProject";
import { AuthPage } from "@/components/AuthPage";
import { SupportPage } from "@/components/SupportPage";
import { CreateProject } from "@/components/CreateProject";
import { ProjectList } from "@/components/ProjectList";
import { FilePage } from "@/components/FilePage";
import { FinancePage } from "@/components/FinancePage";
import { CashFlowPage } from "@/components/CashFlowPage";
import { InvoicesPage } from "@/components/InvoicesPage";
import { BillsPage } from "@/components/BillsPage";
import { RecurringPage } from "@/components/RecurringPage";
import { useProjects, Project } from "@/hooks/useProjects";
import { useEffect } from "react";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("tasks");
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
          });
        }
      }
    };

    fetchCurrentProject();
  }, [selectedProject]);

  const handleSelectProject = (projectId: string) => {
    console.log("Setting selected project:", projectId);
    setSelectedProject(projectId);
  };

  const renderContent = () => {
    switch (currentPage) {
      case "tasks":
        return <TaskManagement onNavigate={setCurrentPage} />;
      case "dashboard":
        return <ProjectDashboard onSelectProject={handleSelectProject} onNavigate={setCurrentPage} />;
      case "create-project":
        return <CreateProject onNavigate={setCurrentPage} />;
      case "projects":
        return <ProjectList onNavigate={setCurrentPage} onSelectProject={handleSelectProject} />;
      case "project-detail":
        return <ProjectDetail projectId={selectedProject} onNavigate={setCurrentPage} />;
      case "project-files":
        return currentProject ? (
          <ProjectFilePage project={currentProject} onNavigate={setCurrentPage} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Project not found</p>
          </div>
        );
      case "project-settings":
        return currentProject ? (
          <ProjectSettingsPage project={currentProject} onNavigate={setCurrentPage} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Project not found</p>
          </div>
        );
      case "upload":
        return <UploadProject onNavigate={setCurrentPage} />;
      case "files":
        return <FilePage onNavigate={setCurrentPage} />;
      case "finance":
        return <FinancePage onNavigate={setCurrentPage} />;
      case "cashflow":
        return <CashFlowPage onNavigate={setCurrentPage} />;
      case "invoices":
        return <InvoicesPage onNavigate={setCurrentPage} />;
      case "bills":
        return <BillsPage onNavigate={setCurrentPage} />;
      case "recurring":
        return <RecurringPage onNavigate={setCurrentPage} />;
      case "auth":
        return <AuthPage onNavigate={setCurrentPage} />;
      case "support":
        return <SupportPage />;
      default:
        return <TaskManagement onNavigate={setCurrentPage} />;
    }
  };

  // Hide main sidebar for project-specific pages
  const showMainSidebar = !["project-detail", "project-files", "project-settings"].includes(currentPage);

  return (
    <div className="min-h-screen flex">
      {showMainSidebar && (
        <AppSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      )}
      <main className={`flex-1 overflow-hidden glass-card animate-fade-in ${showMainSidebar ? '' : 'w-full'}`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
