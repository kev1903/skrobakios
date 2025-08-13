import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Grid3X3, List, Target, Calendar, BarChart3 } from "lucide-react";
import { MyTasksHeaderProps } from './types';

export const MyTasksHeader = ({ 
  tasksCount, 
  viewMode, 
  onViewModeChange, 
  onNavigate 
}: MyTasksHeaderProps) => {
  console.log('MyTasksHeader rendered with onNavigate:', typeof onNavigate);
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-playfair">
            My <span className="text-blue-600">Tasks</span>
          </h1>
          <p className="text-lg text-gray-600">
            {tasksCount === 0 ? 'No tasks assigned to you' : `${tasksCount} ${tasksCount === 1 ? 'task' : 'tasks'} assigned to you`}
          </p>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => onNavigate("dashboard")}
            variant="outline" 
            className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          
          <Button 
            onClick={() => onNavigate("milestones")}
            variant="outline" 
            className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
          >
            <Target className="w-4 h-4 mr-2" />
            Milestones
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            onClick={() => onNavigate("task-create")}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
          
          <div className="bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={`px-4 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className={`px-4 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('calendar')}
              className={`px-4 py-2 ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};