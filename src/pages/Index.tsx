
import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TaskManagement } from "@/components/TaskManagement";
import { ProjectDashboard } from "@/components/ProjectDashboard";
import { ProjectDetail } from "@/components/ProjectDetail";
import { UploadProject } from "@/components/UploadProject";
import { AuthPage } from "@/components/AuthPage";
import { SupportPage } from "@/components/SupportPage";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("tasks");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const renderContent = () => {
    switch (currentPage) {
      case "tasks":
        return <TaskManagement onNavigate={setCurrentPage} />;
      case "dashboard":
        return <ProjectDashboard onSelectProject={setSelectedProject} onNavigate={setCurrentPage} />;
      case "project-detail":
        return <ProjectDetail projectId={selectedProject} onNavigate={setCurrentPage} />;
      case "upload":
        return <UploadProject onNavigate={setCurrentPage} />;
      case "auth":
        return <AuthPage onNavigate={setCurrentPage} />;
      case "support":
        return <SupportPage />;
      default:
        return <TaskManagement onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AppSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
