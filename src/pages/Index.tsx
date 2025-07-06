
import { useState } from "react";
import { UserProvider } from "@/contexts/UserContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { TaskProvider } from "@/components/tasks/TaskContext";
import { ContentRenderer } from "@/components/layout/ContentRenderer";
import { PageLayout } from "@/components/layout/PageLayout";
import { useProjectState } from "@/hooks/useProjectState";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("auth");
  const { selectedProject, currentProject, handleSelectProject } = useProjectState();

  return (
    <AuthProvider>
      <UserProvider>
        <TaskProvider>
          {currentPage === "sales" ? (
            // Sales CRM takes full screen - no main layout wrapper
            <ContentRenderer 
              currentPage={currentPage}
              onNavigate={setCurrentPage}
              onSelectProject={handleSelectProject}
              selectedProject={selectedProject}
              currentProject={currentProject}
            />
          ) : (
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
              </div>
            </div>
          )}
        </TaskProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export default Index;
