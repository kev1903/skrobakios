import React from 'react';
import { ArrowLeft, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project } from '@/hooks/useProjects';

interface GanttSidebarProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const GanttSidebar = ({ project, onNavigate }: GanttSidebarProps) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <Button
          variant="ghost"
          onClick={() => onNavigate("project-schedule")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Schedule</span>
        </Button>
        
        <div className="mb-2">
          <h2 className="text-lg font-semibold text-gray-900">{project.name}</h2>
          <p className="text-sm text-gray-500">Gantt Chart View</p>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg border border-blue-200">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Gantt Chart</span>
          </div>
          <button 
            onClick={() => onNavigate("project-schedule")}
            className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Timeline View</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Resource View</span>
          </button>
        </div>
      </nav>
    </div>
  );
};