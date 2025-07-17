import React from 'react';
import { Project } from "@/hooks/useProjects";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { Calendar, Clock, Milestone, TrendingUp } from 'lucide-react';

interface ProjectTimelinePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectTimelinePage = ({ project, onNavigate }: ProjectTimelinePageProps) => {
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

  return (
    <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
      {/* Project Sidebar */}
      <ProjectSidebar 
        project={project} 
        onNavigate={onNavigate} 
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="timeline"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-48 backdrop-blur-xl bg-white/95 border-l border-white/10 animate-fade-in">
        <div className="max-w-6xl mx-auto p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Project Timeline
                </h1>
                <p className="text-muted-foreground">
                  Track project milestones and progress for {project.name}
                </p>
              </div>
            </div>

            {/* Coming Soon Content */}
            <div className="bg-card rounded-xl border p-8">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">Timeline View Coming Soon</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  Visualize your project timeline with milestones, dependencies, and progress tracking.
                </p>
                
                {/* Feature Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Milestone className="w-6 h-6 text-blue-500" />
                    </div>
                    <h4 className="font-medium text-foreground mb-1">Milestones</h4>
                    <p className="text-sm text-muted-foreground">Track key project deliverables and deadlines</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-green-500" />
                    </div>
                    <h4 className="font-medium text-foreground mb-1">Dependencies</h4>
                    <p className="text-sm text-muted-foreground">Manage task relationships and critical paths</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-purple-500" />
                    </div>
                    <h4 className="font-medium text-foreground mb-1">Progress</h4>
                    <p className="text-sm text-muted-foreground">Monitor real-time project advancement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};