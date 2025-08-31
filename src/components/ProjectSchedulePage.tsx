import React, { useState } from 'react';
import { Project } from "@/hooks/useProjects";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { ResponsiveTimelineView } from "@/components/timeline/ResponsiveTimelineView";
import { useScreenSize } from "@/hooks/use-mobile";
import { useMenuBarSpacing } from "@/hooks/useMenuBarSpacing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Menu, X, Calendar, Plus, Filter, Download, Clock } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface ProjectSchedulePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectSchedulePage = ({ project, onNavigate }: ProjectSchedulePageProps) => {
  const screenSize = useScreenSize();
  const { fullHeightClasses } = useMenuBarSpacing('project-schedule');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Responsive classes based on screen size
  const containerClasses = {
    mobile: "flex flex-col h-screen",
    tablet: "flex flex-col h-screen", 
    desktop: "flex h-screen"
  };

  const mainContentClasses = {
    mobile: "flex-1 min-h-0 overflow-hidden",
    tablet: "flex-1 min-h-0 overflow-hidden",
    desktop: "flex-1 ml-48 min-h-0 overflow-hidden"
  };

  const headerClasses = {
    mobile: "p-4 bg-white border-b border-gray-200",
    tablet: "p-4 bg-white border-b border-gray-200",
    desktop: "p-6 bg-white border-b border-gray-200"
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
          activeSection="schedule"
        />
      )}

      {/* Main Content Area */}
      <main className={mainContentClasses[screenSize]}>
        {/* Header Banner - Match Scope page */}
        <div className="flex-shrink-0 border-b border-border px-6 py-4 bg-white backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
                      activeSection="schedule"
                    />
                  </SheetContent>
                </Sheet>
              )}

              <div>
                <h1 className="text-2xl font-bold text-foreground font-inter">Project Schedule</h1>
                <p className="text-muted-foreground mt-1 text-sm font-inter">{project.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-muted-foreground font-inter">Schedule Progress</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-300 bg-green-500"
                      style={{ width: "52%" }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground font-inter">52%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="hidden sm:flex font-inter text-xs">
                  <Filter className="w-3 h-3 mr-1" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="hidden sm:flex font-inter text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
                <Button size="sm" className="font-inter text-xs">
                  <Plus className="w-3 h-3 mr-1" />
                  Add Task
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Content */}
        <div className="flex-1 px-6 py-4 bg-white">
          <div className="space-y-6">
            {/* Schedule Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Project Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">180 days</div>
                  <p className="text-xs text-gray-500 mt-1">Planned timeline</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Tasks Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">45/87</div>
                  <p className="text-xs text-gray-500 mt-1">52% complete</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Critical Path</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">15 days</div>
                  <p className="text-xs text-gray-500 mt-1">Behind schedule</p>
                </CardContent>
              </Card>
            </div>

            {/* Timeline Component */}
            <Card className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Project Timeline</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      Calendar View
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ResponsiveTimelineView
                  projectId={project.id}
                  projectName={project.name}
                  companyId={project.company_id}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};