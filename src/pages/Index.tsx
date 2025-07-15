
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { DigitalObjectsProvider } from "@/contexts/DigitalObjectsContext";
import { TaskProvider } from "@/components/tasks/TaskContext";
import { ContentRenderer } from "@/components/layout/ContentRenderer";
import { PageLayout } from "@/components/layout/PageLayout";
import { useProjectState } from "@/hooks/useProjectState";
import { useNavigationWithHistory } from "@/hooks/useNavigationWithHistory";

const Index = () => {
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState("landing");
  const previousPageRef = useRef<string>("landing");
  const { selectedProject, currentProject, handleSelectProject } = useProjectState();

  // Enhanced navigation function that tracks previous page
  const handleNavigate = (page: string) => {
    // Store current page as previous (unless it's the same page)
    if (page !== currentPage) {
      previousPageRef.current = currentPage;
    }
    setCurrentPage(page);
  };

  // Function to go back to previous page
  const handleGoBack = () => {
    const previousPage = previousPageRef.current;
    // Prevent infinite loops by ensuring we don't go back to the same page
    if (previousPage && previousPage !== currentPage) {
      setCurrentPage(previousPage);
      // Update the previous page reference to avoid going back and forth
      previousPageRef.current = "landing";
    } else {
      // Fallback to a sensible default if no previous page exists
      setCurrentPage("landing");
    }
  };

  // Handle URL parameters for direct navigation
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam && pageParam !== currentPage) {
      // Store current page as previous when URL changes
      previousPageRef.current = currentPage;
      setCurrentPage(pageParam);
    }
  }, [searchParams, currentPage]);

  return (
    <DigitalObjectsProvider>
      <TaskProvider>
        {currentPage === "sales" || currentPage === "projects" || currentPage === "landing" || currentPage === "auth" ? (
          // Sales CRM, Projects, Landing, and Auth take full screen - no main layout wrapper
          <ContentRenderer 
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onSelectProject={handleSelectProject}
            selectedProject={selectedProject}
            currentProject={currentProject}
          />
        ) : (
          // Home and all other pages get layout with sidebar
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
            
            <div className="relative z-10 flex min-h-screen">
              <PageLayout currentPage={currentPage} onNavigate={handleNavigate}>
                <ContentRenderer 
                  currentPage={currentPage}
                  onNavigate={handleNavigate}
                  onSelectProject={handleSelectProject}
                  selectedProject={selectedProject}
                  currentProject={currentProject}
                />
              </PageLayout>
            </div>
          </div>
        )}
      </TaskProvider>
    </DigitalObjectsProvider>
  );
};

export default Index;
