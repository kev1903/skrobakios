import React, { useState } from 'react';
import { Project } from "@/hooks/useProjects";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { useScreenSize } from "@/hooks/use-mobile";
import { useMenuBarSpacing } from "@/hooks/useMenuBarSpacing";
import { Button } from "@/components/ui/button";
import { Menu, RefreshCw, Download, ZoomIn, ZoomOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { JSGanttChart } from "@/components/gantt/JSGanttChart";
import { useWBS } from "@/hooks/useWBS";

interface ProjectTimelinePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectTimelinePage = ({ project, onNavigate }: ProjectTimelinePageProps) => {
  const screenSize = useScreenSize();
  const { fullHeightClasses } = useMenuBarSpacing('project-timeline');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // WBS data hook
  const { wbsItems, loading, error, loadWBSItems, updateWBSItem } = useWBS(project.id);

  // Responsive classes based on screen size
  const containerClasses = {
    mobile: "flex flex-col overflow-hidden",
    tablet: "flex flex-col overflow-hidden", 
    desktop: "flex overflow-hidden"
  };

  const mainContentClasses = {
    mobile: "flex-1 min-h-0 overflow-hidden",
    tablet: "flex-1 min-h-0 overflow-hidden",
    desktop: "flex-1 ml-40 min-h-0 overflow-hidden"
  };

  return (
    <div className={`${containerClasses[screenSize]} ${fullHeightClasses}`}>
      {/* Desktop Sidebar */}
      {screenSize === 'desktop' && (
        <ProjectSidebar
          project={project}
          onNavigate={onNavigate}
          getStatusColor={(status: string) => {
            switch (status) {
              case 'active': return 'bg-green-100 text-green-800';
              case 'pending': return 'bg-yellow-100 text-yellow-800';
              case 'completed': return 'bg-blue-100 text-blue-800';
              default: return 'bg-gray-100 text-gray-800';
            }
          }}
          getStatusText={(status: string) => status}
          activeSection="timeline"
        />
      )}

      {/* Main Content Area */}
      <main className={mainContentClasses[screenSize]}>
        {/* Header Banner - Responsive */}
        <div className="flex-shrink-0 border-b border-border px-3 sm:px-6 py-2 sm:py-3 bg-white backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Menu Button */}
              {(screenSize === 'mobile' || screenSize === 'tablet') && (
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="p-2"
                    >
                      <Menu className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-64">
                    <ProjectSidebar
                      project={project}
                      onNavigate={onNavigate}
                      getStatusColor={(status: string) => {
                        switch (status) {
                          case 'active': return 'bg-green-100 text-green-800';
                          case 'pending': return 'bg-yellow-100 text-yellow-800';
                          case 'completed': return 'bg-blue-100 text-blue-800';
                          default: return 'bg-gray-100 text-gray-800';
                        }
                      }}
                      getStatusText={(status: string) => status}
                      activeSection="timeline"
                    />
                  </SheetContent>
                </Sheet>
              )}

              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground font-inter">Project Timeline</h1>
                <p className="text-muted-foreground mt-1 text-xs sm:text-sm font-inter">{project.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Content Area */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="flex-shrink-0 border-b border-border px-3 sm:px-6 py-2 bg-background">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadWBSItems}
                  disabled={loading}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <ZoomOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Zoom Out</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <ZoomIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Zoom In</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Gantt Chart */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-lg font-medium text-destructive mb-2">Error loading timeline</p>
                  <p className="text-sm text-muted-foreground mb-4">{error}</p>
                  <Button onClick={loadWBSItems} variant="outline">
                    Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <JSGanttChart
                tasks={wbsItems}
                onTaskUpdate={updateWBSItem}
                loading={loading}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};