
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthPage } from "@/components/auth/AuthPage";
import { ServicesPage } from "@/components/pages/ServicesPage";
import { ProjectsPage } from "@/components/pages/ProjectsPage";
import { AboutPage } from "@/components/pages/AboutPage";
import { ContactPage } from "@/components/pages/ContactPage";

import { TaskProvider } from "@/components/tasks/TaskContext";
import { MobileHeader } from "@/components/MobileHeader";
import { ContentRenderer } from "@/components/layout/ContentRenderer";
import { PageLayout } from "@/components/layout/PageLayout";

import { useProjectState } from "@/hooks/useProjectState";
import { useNavigationWithHistory } from "@/hooks/useNavigationWithHistory";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cleanupDigitalObjectsCache } from "@/utils/cacheCleanup";
import { MobileBottomBar } from "@/components/MobileBottomBar";

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState(() => {
    // Initialize based on current route - if we're on root path, show auth page
    return window.location.pathname === "/" ? "auth" : "auth";
  });
  const [mobileView, setMobileView] = useState<'chat' | 'app'>('app');
  const previousPageRef = useRef<string>("auth");
  const { selectedProject, currentProject, handleSelectProject } = useProjectState();
  const isMobile = useIsMobile();
  

  // Enhanced navigation function that tracks previous page
  const handleNavigate = (page: string) => {
    console.log(`🧭 Navigation requested: ${currentPage} -> ${page}`);
    
    // Handle URLs with query parameters (like project-cost?projectId=123)
    let targetPage = page;
    let paramsObj: Record<string, string> = {};
    let projectId: string | null = null;

    if (page.includes('?')) {
      const [pageName, queryString] = page.split('?');
      targetPage = pageName;
      const params = new URLSearchParams(queryString);
      params.forEach((value, key) => {
        paramsObj[key] = value;
      });
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
    // Sync URL with internal navigation to avoid being overridden by ?page= params
    const search = new URLSearchParams();
    search.set('page', targetPage);
    Object.entries(paramsObj).forEach(([key, value]) => search.set(key, value));
    navigate({ pathname: '/', search: `?${search.toString()}` }, { replace: false });
  };

  // Function to go back to previous page
  const handleGoBack = () => {
    const previousPage = previousPageRef.current;
    // Prevent infinite loops by ensuring we don't go back to the same page
    if (previousPage && previousPage !== currentPage) {
      setCurrentPage(previousPage);
      // Update the previous page reference to avoid going back and forth
      previousPageRef.current = "auth";
    } else {
      // Fallback to a sensible default if no previous page exists
      setCurrentPage("auth");
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

  // Clean up digital objects cache on app start
  useEffect(() => {
    cleanupDigitalObjectsCache();
  }, []);

  // Redirect authenticated users away from public pages
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const publicPages = ['auth', 'services', 'about', 'contact', 'signup'];
      if (publicPages.includes(currentPage)) {
        console.log(`🔐 Authenticated user on public page ${currentPage}, redirecting to profile`);
        handleNavigate('profile');
      }
    }
  }, [isAuthenticated, loading, currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'services':
        return <ServicesPage onNavigate={handleNavigate} />;
      case 'projects':
        return <ProjectsPage onNavigate={handleNavigate} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactPage onNavigate={handleNavigate} />;
      case 'auth':
      default:
        return <AuthPage onNavigate={handleNavigate} />;
    }
  };

  // Handle public pages vs protected pages
  if (currentPage === 'auth' || currentPage === 'signup' || 
      currentPage === 'services' || currentPage === 'about' || currentPage === 'contact') {
    return (
      <div className="w-full h-screen">
        {renderPage()}
      </div>
    );
  }

  return (
    <TaskProvider>
        {currentPage === "sales" || currentPage === "auth" ? (
          // Sales CRM and Auth take full screen - no main layout wrapper
          <div className="flex h-screen min-h-0 overflow-hidden">
            <div className="flex-1 bg-background transition-all duration-300">
              <ContentRenderer 
                currentPage={currentPage}
                onNavigate={handleNavigate}
                onSelectProject={handleSelectProject}
                selectedProject={selectedProject}
                currentProject={currentProject}
              />
            </div>
          </div>
        ) : isMobile ? (
          // Mobile layout with bottom navigation bar
          <div className="flex flex-col h-screen min-h-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
            {/* Mobile header (fixed) */}
            <div className="flex-shrink-0">
              <MobileHeader onNavigate={handleNavigate} />
            </div>
            
            {/* Main content area - fills remaining space */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {mobileView === 'chat' ? (
                // AI Chat view on mobile - Show full screen chat modal in menu bar instead
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Click the AI chat icon in the menu bar to start chatting</p>
                </div>
              ) : (
                // App view on mobile
                <div className="w-full h-full">
                  <PageLayout currentPage={currentPage} onNavigate={handleNavigate} disableSpacing>
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
              )}
            </div>
            
            {/* Mobile bottom navigation bar (fixed) */}
            <div className="flex-shrink-0">
              <MobileBottomBar onNavigate={handleNavigate} />
            </div>
          </div>
        ) : (
          // Home and all other pages get layout with sidebar (desktop/tablet)
          <div className="h-screen min-h-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
            
            <div className="relative z-10 flex h-screen min-h-0">
              <div className="flex-1 bg-background transition-all duration-300">
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
              
            </div>
          </div>
        )}
      </TaskProvider>
  );
};

export default Index;
