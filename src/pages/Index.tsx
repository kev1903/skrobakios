
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ProjectDashboard } from "@/components/ProjectDashboard";
import { ProjectDetail } from "@/components/ProjectDetail";
import { UploadProject } from "@/components/UploadProject";
import { AuthPage } from "@/components/AuthPage";
import { SupportPage } from "@/components/SupportPage";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const renderContent = () => {
    switch (currentPage) {
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
        return <ProjectDashboard onSelectProject={setSelectedProject} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
