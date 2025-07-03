import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GanttChart } from './GanttChart';
import { GanttSidebar } from './gantt/GanttSidebar';
import { GanttHeader } from './gantt/GanttHeader';
import { ProjectOverviewCard } from './gantt/ProjectOverviewCard';
import { mockGanttTasks } from '@/data/ganttMockData';
import { Project } from '@/hooks/useProjects';

interface GanttChartPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const GanttChartPage = ({ project, onNavigate }: GanttChartPageProps) => {
  return (
    <div className="h-screen flex bg-gray-50">
      <GanttSidebar project={project} onNavigate={onNavigate} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <GanttHeader project={project} />
          <ProjectOverviewCard project={project} />

          {/* Gantt Chart */}
          <Card>
            <CardContent className="p-6">
              <GanttChart
                tasks={mockGanttTasks}
                startDate={new Date('2025-05-15')}
                endDate={new Date('2025-06-10')}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
