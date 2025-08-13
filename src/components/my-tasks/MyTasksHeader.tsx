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
          <h1 className="heading-lg text-foreground mb-4 font-playfair">
            My <span className="text-gradient-blue">Tasks</span>
          </h1>
          <p className="body-md text-muted-foreground">
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
            className="button-ghost"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          
          <Button 
            onClick={() => onNavigate("milestones")}
            variant="outline" 
            className="button-ghost"
          >
            <Target className="w-4 h-4 mr-2" />
            Milestones
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            onClick={() => onNavigate("task-create")}
            className="button-blue"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
          
          <div className="glass-card p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="px-4 py-2"
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="px-4 py-2"
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('calendar')}
              className="px-4 py-2"
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