import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GanttChart } from './GanttChart';
import { ProjectSidebar } from './ProjectSidebar';
import { GanttHeader } from './gantt/GanttHeader';
import { ProjectOverviewCard } from './gantt/ProjectOverviewCard';
import { mockGanttTasks } from '@/data/ganttMockData';
import { Project } from '@/hooks/useProjects';

interface GanttChartPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const GanttChartPage = ({ project, onNavigate }: GanttChartPageProps) => {
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
      <ProjectSidebar 
        project={project} 
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="gantt"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-48 backdrop-blur-xl bg-white/5 border-l border-white/10">
        <div className="p-8">
          <GanttHeader project={project} />
          <ProjectOverviewCard project={project} />

          {/* Gantt Chart - Fullscreen */}
          <div className="flex-1">
            <GanttChart
              tasks={mockGanttTasks}
              startDate={new Date('2025-05-15')}
              endDate={new Date('2025-06-10')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
