
import { useState } from "react";
import { UserProvider } from "@/contexts/UserContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { useCurrentProject } from "@/hooks/useCurrentProject";
import { PageRouter } from "@/components/routing/PageRouter";
import { AppLayout } from "@/components/layout/AppLayout";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("auth");
  const { selectedProject, handleSelectProject, getCurrentProject } = useCurrentProject();

  return (
    <AuthProvider>
      <UserProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
          
          <div className="flex relative z-10">
            <AppLayout currentPage={currentPage} onNavigate={setCurrentPage}>
              <PageRouter
                currentPage={currentPage}
                selectedProject={selectedProject}
                getCurrentProject={getCurrentProject}
                onNavigate={setCurrentPage}
                onSelectProject={handleSelectProject}
              />
            </AppLayout>
          </div>
        </div>
      </UserProvider>
    </AuthProvider>
  );
};

export default Index;
