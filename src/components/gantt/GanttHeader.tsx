import React from 'react';
import { Download, Settings, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project } from '@/hooks/useProjects';

interface GanttHeaderProps {
  project: Project;
}

export const GanttHeader = ({ project }: GanttHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Gantt Chart</h1>
        <p className="text-gray-600">{project.name} - Project Timeline</p>
      </div>
      <div className="flex space-x-3">
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Chart
        </Button>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          View Options
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Calendar className="w-4 h-4 mr-2" />
          Update Tasks
        </Button>
      </div>
    </div>
  );
};