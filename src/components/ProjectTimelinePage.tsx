import React, { useState } from 'react';
import { Project } from "@/hooks/useProjects";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { TimelineView } from "./timeline/TimelineView";
import { useScreenSize } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface ProjectTimelinePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectTimelinePage = ({ project, onNavigate }: ProjectTimelinePageProps) => {
  const screenSize = useScreenSize();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "running":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "pending":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "running":
        return "In Progress";
      case "pending":
        return "Pending";
      default:
        return "Active";
    }
  };

  // Mobile layout with drawer
  if (screenSize === 'mobile') {
    return (
      <div className="h-screen flex flex-col backdrop-blur-xl bg-black/20">
        {/* Mobile Header */}
        <div className="flex-shrink-0 h-16 px-4 flex items-center justify-between backdrop-blur-xl bg-white/10 border-b border-white/10">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-white/10 backdrop-blur-md border-white/20">
              <ProjectSidebar 
                project={project} 
                onNavigate={(page) => {
                  onNavigate(page);
                  setSidebarOpen(false);
                }} 
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                activeSection="timeline"
              />
            </SheetContent>
          </Sheet>
          
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-white truncate">{project.name}</h1>
            <p className="text-sm text-white/70">Timeline</p>
          </div>
          
          <div className="w-10" /> {/* Spacer for balance */}
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-auto backdrop-blur-xl bg-white/95">
          <div className="p-4">
            <TimelineView 
              projectId={project.id}
              projectName={project.name}
              companyId={project.company_id}
            />
          </div>
        </div>
      </div>
    );
  }

  // Tablet layout with collapsible sidebar
  if (screenSize === 'tablet') {
    return (
      <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
        {/* Tablet Sidebar - Collapsible */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} flex-shrink-0`}>
          <div className="relative h-full">
            <ProjectSidebar 
              project={project} 
              onNavigate={onNavigate} 
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              activeSection="timeline"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute -right-3 top-4 z-10 bg-white/20 backdrop-blur-sm border border-white/20 text-white hover:bg-white/30"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Tablet Content */}
        <div className="flex-1 overflow-auto backdrop-blur-xl bg-white/95 border-l border-white/10">
          <div className="p-6">
            <TimelineView 
              projectId={project.id}
              projectName={project.name}
              companyId={project.company_id}
            />
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout (unchanged)
  return (
    <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
      {/* Desktop Sidebar */}
      <ProjectSidebar 
        project={project} 
        onNavigate={onNavigate} 
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="timeline"
      />

      {/* Desktop Content */}
      <div className="flex-1 overflow-auto ml-48 backdrop-blur-xl bg-white/95 border-l border-white/10 animate-fade-in">
        <div className="max-w-7xl mx-auto p-6">
          <TimelineView 
            projectId={project.id}
            projectName={project.name}
            companyId={project.company_id}
          />
        </div>
      </div>
    </div>
  );
};
