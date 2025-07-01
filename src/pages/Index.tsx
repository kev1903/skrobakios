
import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TaskManagement } from "@/components/TaskManagement";
import { ProjectDashboard } from "@/components/ProjectDashboard";
import { ProjectDetail } from "@/components/ProjectDetail";
import { ProjectFilePage } from "@/components/ProjectFilePage";
import { ProjectSettingsPage } from "@/components/ProjectSettingsPage";
import { ProjectSchedulePage } from "@/components/ProjectSchedulePage";
import { ProjectTasksPage } from "@/components/ProjectTasksPage";
import { ProjectTeamPage } from "@/components/ProjectTeamPage";
import { GanttChartPage } from "@/components/GanttChartPage";
import { UploadProject } from "@/components/UploadProject";
import { AuthPage } from "@/components/AuthPage";
import { SupportPage } from "@/components/SupportPage";
import { CreateProject } from "@/components/CreateProject";
import { ProjectList } from "@/components/ProjectList";
import { FilePage } from "@/components/FilePage";
import { FinancePage } from "@/components/FinancePage";
import { FinanceSettingsPage } from "@/components/FinanceSettingsPage";
import { CashFlowPage } from "@/components/CashFlowPage";
import { InvoicesPage } from "@/components/InvoicesPage";
import { BillsPage } from "@/components/BillsPage";
import { RecurringPage } from "@/components/RecurringPage";
import { UserEditPage } from "@/components/UserEditPage";
import { UserProvider } from "@/contexts/UserContext";
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
      case "project-tasks":
        return currentProject ? (
          <ProjectTasksPage project={currentProject} onNavigate={setCurrentPage} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">Project not found</p>
          </div>
        );
      case "project-files":
        return currentProject ? (
          <ProjectFilePage project={currentProject} onNavigate={setCurrentPage} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">Project not found</p>
          </div>
        );
      case "project-settings":
        return currentProject ? (
          <ProjectSettingsPage project={currentProject} onNavigate={setCurrentPage} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">Project not found</p>
          </div>
        );
      case "project-schedule":
        return currentProject ? (
          <ProjectSchedulePage project={currentProject} onNavigate={setCurrentPage} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">Project not found</p>
          </div>
        );
      case "project-team":
        return currentProject ? (
          <ProjectTeamPage project={currentProject} onNavigate={setCurrentPage} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">Project not found</p>
          </div>
        );
      case "gantt-chart":
        return currentProject ? (
          <GanttChartPage project={currentProject} onNavigate={setCurrentPage} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">Project not found</p>
          </div>
        );
      case "upload":
        return <UploadProject onNavigate={setCurrentPage} />;
      case "files":
        return <FilePage onNavigate={setCurrentPage} />;
      case "finance":
        return <FinancePage onNavigate={setCurrentPage} />;
      case "finance-settings":
        return <FinanceSettingsPage onNavigate={setCurrentPage} />;
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
      case "user-edit":
        return <UserEditPage onNavigate={setCurrentPage} />;
      default:
        return <TaskManagement onNavigate={setCurrentPage} />;
    }
  };

  // Hide main sidebar for project-specific pages and user edit page
  const showMainSidebar = !["project-detail", "project-tasks", "project-files", "project-settings", "project-schedule", "project-team", "gantt-chart", "user-edit"].includes(currentPage);

  return (
    <UserProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
        
        <div className="flex relative z-10">
          {showMainSidebar ? (
            <AppSidebar currentPage={currentPage} onNavigate={setCurrentPage}>
              <main className="flex-1 overflow-hidden backdrop-blur-xl bg-white/20 border border-white/20 shadow-xl transition-all duration-300 rounded-l-2xl ml-2 my-2 mr-2">
                {renderContent()}
              </main>
            </AppSidebar>
          ) : (
            <main className="flex-1 overflow-hidden backdrop-blur-xl bg-white/20 border border-white/20 shadow-xl transition-all duration-300 w-full">
              {renderContent()}
            </main>
          )}
        </div>
      </div>
    </UserProvider>
  );
};

export default Index;
