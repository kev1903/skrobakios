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
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">MY TASKS</h1>
          <p className="text-muted-foreground text-sm">
            {tasksCount === 0 ? 'No tasks assigned to you' : `${tasksCount} ${tasksCount === 1 ? 'task' : 'tasks'} assigned to you`}
          </p>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => onNavigate("dashboard")}
            size="sm"
            variant="outline"
            className="border-primary/20 hover:bg-primary/5"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Dashboard
          </Button>
          
          <Button 
            onClick={() => onNavigate("milestones")}
            size="sm"
            variant="outline"
            className="border-primary/20 hover:bg-primary/5"
          >
            <Target className="w-4 h-4 mr-1" />
            Milestones
          </Button>
          
          <Button 
            onClick={() => onNavigate("projects")}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-1" />
            +New Task
          </Button>
          
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="px-3 py-1.5 h-auto"
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="px-3 py-1.5 h-auto"
            >
              <Grid3X3 className="w-4 h-4 mr-1" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('calendar')}
              className="px-3 py-1.5 h-auto"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Calendar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};