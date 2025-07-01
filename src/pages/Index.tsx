
import { useState } from "react";
import { UserProvider } from "@/contexts/UserContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ContentRenderer } from "@/components/layout/ContentRenderer";
import { PageLayout } from "@/components/layout/PageLayout";
import { useProjectState } from "@/hooks/useProjectState";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("auth");
  const { selectedProject, currentProject, handleSelectProject } = useProjectState();

  return (
    <AuthProvider>
      <UserProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-600 to-white relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
          
          <div className="flex relative z-10 h-screen">
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
      </UserProvider>
    </AuthProvider>
  );
};

export default Index;
