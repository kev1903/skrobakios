import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Grid3X3, List } from "lucide-react";
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
      <div className="flex items-center justify-between">
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
        </div>
      </div>
    </div>
  );
};