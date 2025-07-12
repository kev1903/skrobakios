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
import { useRoleContext } from "@/contexts/RoleContext";
import { PlatformSidebar } from "@/components/PlatformSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

// Create a component that uses role context inside the providers
const IndexContent = () => {
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState("auth");
  const { selectedProject, currentProject, handleSelectProject } = useProjectState();
  const { isPlatformMode } = useRoleContext();

  // Add event listener for custom sidebar toggle event
  useEffect(() => {
    const handleToggleSidebar = () => {
      const sidebarTrigger = document.querySelector('[data-sidebar="trigger"]') as HTMLButtonElement;
      if (sidebarTrigger) {
        sidebarTrigger.click();
      }
    };

    window.addEventListener('toggle-sidebar', handleToggleSidebar);
    return () => window.removeEventListener('toggle-sidebar', handleToggleSidebar);
  }, []);

  // Handle URL parameters for direct navigation
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      setCurrentPage(pageParam);
    }
  }, [searchParams]);

  return (
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
            
            {isPlatformMode ? (
              // Platform mode with sidebar on home page
              <SidebarProvider defaultOpen={false}>
                <div className="relative z-10 flex min-h-screen">
                  <PlatformSidebar />
                  <div className="flex-1">
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
                  <ModeIndicator />
                </div>
              </SidebarProvider>
            ) : (
              // Company mode without platform sidebar
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
            )}
          </div>
        ) : (
          // All other pages get clean layout with conditional platform sidebar
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 relative">
            <div className="relative z-10 flex min-h-screen w-full">
              {isPlatformMode ? (
                // Platform mode with sidebar
                <SidebarProvider defaultOpen={true}>
                  <div className="flex min-h-screen w-full">
                    {/* Platform Sidebar */}
                    <PlatformSidebar />
                    
                    {/* Main Content */}
                    <div className="flex-1 flex flex-col">
                      {/* Header with sidebar trigger */}
                       <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur-sm px-4">
                         <SidebarTrigger className="mr-2 p-2 hover:bg-muted rounded-md transition-colors" />
                         <div className="flex items-center gap-2">
                           <span className="text-sm font-medium text-muted-foreground">Platform Administration</span>
                         </div>
                       </header>
                      
                      {/* Page Content */}
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
                </SidebarProvider>
              ) : (
                // Company mode without platform sidebar
                <PageLayout currentPage={currentPage} onNavigate={setCurrentPage}>
                  <ContentRenderer 
                    currentPage={currentPage}
                    onNavigate={setCurrentPage}
                    onSelectProject={handleSelectProject}
                    selectedProject={selectedProject}
                    currentProject={currentProject}
                  />
                </PageLayout>
              )}
              <ModeIndicator />
            </div>
          </div>
        )}
      </TaskProvider>
    </DigitalObjectsProvider>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <UserProvider>
        <RoleProvider>
          <IndexContent />
        </RoleProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export default Index;