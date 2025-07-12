
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { DigitalObjectsProvider } from "@/contexts/DigitalObjectsContext";
import { TaskProvider } from "@/components/tasks/TaskContext";
import { ContentRenderer } from "@/components/layout/ContentRenderer";
import { PageLayout } from "@/components/layout/PageLayout";
import { ModeIndicator } from "@/components/ModeIndicator";
import { useProjectState } from "@/hooks/useProjectState";

const Index = () => {
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState("auth");
  const { selectedProject, currentProject, handleSelectProject } = useProjectState();

  // Handle URL parameters for direct navigation
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      setCurrentPage(pageParam);
    }
  }, [searchParams]);

  return (
    <AuthProvider>
      <UserProvider>
        <RoleProvider>
          <DigitalObjectsProvider>
            <TaskProvider>
          {currentPage === "sales" || currentPage === "projects" ? (
            // Sales CRM and Projects take full screen - no main layout wrapper
            <ContentRenderer 
              currentPage={currentPage}
              onNavigate={setCurrentPage}
              onSelectProject={handleSelectProject}
              selectedProject={selectedProject}
              currentProject={currentProject}
            />
          ) : currentPage === "home" ? (
            // Home page gets special treatment with map background and chat
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
              
              <div className="relative z-10 flex min-h-screen">
                <PageLayout currentPage={currentPage} onNavigate={setCurrentPage}>
                  <ContentRenderer 
                    currentPage={currentPage}
                    onNavigate={setCurrentPage}
                    onSelectProject={handleSelectProject}
                    selectedProject={selectedProject}
                    currentProject={currentProject}
                  />
                </PageLayout>
                <ModeIndicator />
              </div>
            </div>
          ) : (
            // All other pages get clean layout without home page elements
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 relative">
              <div className="relative z-10 flex min-h-screen">
                <PageLayout currentPage={currentPage} onNavigate={setCurrentPage}>
                  <ContentRenderer 
                    currentPage={currentPage}
                    onNavigate={setCurrentPage}
                    onSelectProject={handleSelectProject}
                    selectedProject={selectedProject}
                    currentProject={currentProject}
                  />
                </PageLayout>
                <ModeIndicator />
              </div>
            </div>
          )}
            </TaskProvider>
          </DigitalObjectsProvider>
        </RoleProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export default Index;
