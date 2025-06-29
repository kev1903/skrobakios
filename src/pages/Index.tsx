
import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TaskManagement } from "@/components/TaskManagement";
import { ProjectDashboard } from "@/components/ProjectDashboard";
import { ProjectDetail } from "@/components/ProjectDetail";
import { UploadProject } from "@/components/UploadProject";
import { AuthPage } from "@/components/AuthPage";
import { SupportPage } from "@/components/SupportPage";
import { CreateProject } from "@/components/CreateProject";
import { ProjectList } from "@/components/ProjectList";
import { FilePage } from "@/components/FilePage";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("tasks");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

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
      case "upload":
        return <UploadProject onNavigate={setCurrentPage} />;
      case "files":
        return <FilePage onNavigate={setCurrentPage} />;
      case "auth":
        return <AuthPage onNavigate={setCurrentPage} />;
      case "support":
        return <SupportPage />;
      default:
        return <TaskManagement onNavigate={setCurrentPage} />;
    }
  };

  // Hide main sidebar when on project detail page
  const showMainSidebar = currentPage !== "project-detail";

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
