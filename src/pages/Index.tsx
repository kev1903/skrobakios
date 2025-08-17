
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { LandingPage } from "@/components/LandingPage";
import { AuthPage } from "@/components/auth/AuthPage";
import { ServicesPage } from "@/components/pages/ServicesPage";
import { ProjectsPage } from "@/components/pages/ProjectsPage";
import { AboutPage } from "@/components/pages/AboutPage";
import { ContactPage } from "@/components/pages/ContactPage";
import { DigitalObjectsProvider } from "@/contexts/DigitalObjectsContext";
import { TaskProvider } from "@/components/tasks/TaskContext";
import { ContentRenderer } from "@/components/layout/ContentRenderer";
import { PageLayout } from "@/components/layout/PageLayout";
import { AiChatSidebar } from "@/components/AiChatSidebar";
import { GlobalSidebar } from "@/components/GlobalSidebar";
import { useProjectState } from "@/hooks/useProjectState";
import { useNavigationWithHistory } from "@/hooks/useNavigationWithHistory";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState(() => {
    // Initialize based on current route - if we're on root path, show landing page
    return window.location.pathname === "/" ? "landing" : "landing";
  });
  const [isChatCollapsed, setIsChatCollapsed] = useState(true);
  const previousPageRef = useRef<string>("landing");
  const { selectedProject, currentProject, handleSelectProject } = useProjectState();
  const isMobile = useIsMobile();

  // Enhanced navigation function that tracks previous page
  const handleNavigate = (page: string) => {
    console.log(`🧭 Navigation requested: ${currentPage} -> ${page}`);
    
    // Handle URLs with query parameters (like project-cost?projectId=123)
    let targetPage = page;
    let projectId = null;
    
    if (page.includes('?')) {
      const [pageName, queryString] = page.split('?');
      targetPage = pageName;
      const params = new URLSearchParams(queryString);
      projectId = params.get('projectId');
      
      console.log(`🧭 Extracted page: ${targetPage}, projectId: ${projectId}`);
    }
    
    // Store current page as previous (unless it's the same page)
    if (targetPage !== currentPage) {
      previousPageRef.current = currentPage;
    }
    
    // Set the project if provided
    if (projectId && projectId !== selectedProject) {
      console.log(`🧭 Setting project: ${projectId}`);
      handleSelectProject(projectId);
    }
    
    setCurrentPage(targetPage);
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
    const projectIdParam = searchParams.get('projectId');
    
    if (pageParam && pageParam !== currentPage) {
      // Store current page as previous when URL changes
      previousPageRef.current = currentPage;
      setCurrentPage(pageParam);
    }
    
    // Set project if projectId is in URL
    if (projectIdParam && projectIdParam !== selectedProject) {
      handleSelectProject(projectIdParam);
    }
  }, [searchParams, selectedProject, handleSelectProject]);

  // Redirect authenticated users away from public pages
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const publicPages = ['landing', 'services', 'about', 'contact', 'signup'];
      if (publicPages.includes(currentPage)) {
        console.log(`🔐 Authenticated user on public page ${currentPage}, redirecting to profile`);
        handleNavigate('profile');
      }
    }
  }, [isAuthenticated, loading, currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'auth':
        return <AuthPage onNavigate={handleNavigate} />;
      case 'signup':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'services':
        return <ServicesPage onNavigate={handleNavigate} />;
      case 'projects':
        return <ProjectsPage onNavigate={handleNavigate} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactPage onNavigate={handleNavigate} />;
      case 'landing':
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  // Handle public pages vs protected pages
  if (currentPage === 'landing' || currentPage === 'auth' || currentPage === 'signup' || 
      currentPage === 'services' || currentPage === 'about' || currentPage === 'contact') {
    return (
      <div className="w-full h-screen">
        {renderPage()}
      </div>
    );
  }

  return (
    <DigitalObjectsProvider>
      <TaskProvider>
        {currentPage === "sales" || currentPage === "landing" || currentPage === "auth" ? (
          // Sales CRM, Landing, and Auth take full screen - no main layout wrapper
          <div className="flex h-screen min-h-0">
            <div className={`flex-1 transition-all duration-300 ${currentPage !== "landing" && currentPage !== "auth" ? (isChatCollapsed ? "mr-16" : "mr-96") : ""}`}>
              <ContentRenderer 
                currentPage={currentPage}
                onNavigate={handleNavigate}
                onSelectProject={handleSelectProject}
                selectedProject={selectedProject}
                currentProject={currentProject}
              />
            </div>
            {/* AI Chat sidebar on all pages except landing/auth */}
            {currentPage !== "landing" && currentPage !== "auth" && (
              <AiChatSidebar 
                isCollapsed={isChatCollapsed} 
                onToggleCollapse={() => setIsChatCollapsed(!isChatCollapsed)}
                onNavigate={handleNavigate}
              />
            )}
            {/* Global sidebar available on all pages */}
            <GlobalSidebar currentPage={currentPage} onNavigate={handleNavigate} />
          </div>
        ) : currentPage === "home" && isMobile ? (
          // Mobile home page: Show only AI chat full screen, hide map
          <div className="h-screen min-h-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
            
            <div className="relative z-10 flex h-screen min-h-0">
              {/* AI Chat sidebar takes full width on mobile home page */}
              <div className="w-full">
                <AiChatSidebar 
                  isCollapsed={false} 
                  onToggleCollapse={() => {}} // Disable collapse on mobile home
                  onNavigate={handleNavigate}
                />
              </div>
              
              {/* Global sidebar available on all pages */}
              <GlobalSidebar currentPage={currentPage} onNavigate={handleNavigate} />
            </div>
          </div>
        ) : (
          // Home and all other pages get layout with sidebar (desktop/tablet)
          <div className="h-screen min-h-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
            
            <div className="relative z-10 flex h-screen min-h-0">
              <div className={`flex-1 transition-all duration-300 ${isChatCollapsed ? "mr-16" : "mr-96"}`}>
        <PageLayout currentPage={currentPage} onNavigate={handleNavigate}>
          <div className="w-full h-full">
            <ContentRenderer 
              currentPage={currentPage}
              onNavigate={handleNavigate}
              onSelectProject={handleSelectProject}
              selectedProject={selectedProject}
              currentProject={currentProject}
            />
          </div>
        </PageLayout>
              </div>
              
              {/* AI Chat sidebar appears on all pages */}
              <AiChatSidebar 
                isCollapsed={isChatCollapsed} 
                onToggleCollapse={() => setIsChatCollapsed(!isChatCollapsed)}
                onNavigate={handleNavigate}
              />
              
              {/* Global sidebar available on all pages */}
              <GlobalSidebar currentPage={currentPage} onNavigate={handleNavigate} />
            </div>
          </div>
        )}
      </TaskProvider>
    </DigitalObjectsProvider>
  );
};

export default Index;
