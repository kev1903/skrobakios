import React, { useState, useEffect } from 'react';
import { CentralTask } from '@/services/centralTaskService';
import { GanttTaskList } from './GanttTaskList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, eachDayOfInterval, addDays, differenceInDays, startOfMonth, endOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfessionalGanttChartProps {
  tasks: CentralTask[];
  onTaskUpdate?: (taskId: string, updates: Partial<CentralTask>) => void;
  className?: string;
  projectTitle?: string;
}

export const ProfessionalGanttChart = ({ 
  tasks, 
  onTaskUpdate, 
  className,
  projectTitle = "Project Timeline"
}: ProfessionalGanttChartProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [zoomLevel, setZoomLevel] = useState(1);
  const [taskListWidth, setTaskListWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);

  // Calculate date range for timeline
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(addDays(currentDate, 180)); // Show 6 months
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  const dayWidth = 24 * zoomLevel;
  const timelineWidth = days.length * dayWidth;

  // Handle resizing the divider
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = Math.max(300, Math.min(600, e.clientX));
        setTaskListWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Navigation functions
  const goToPrevMonth = () => {
    setCurrentDate(prev => addDays(prev, -30));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => addDays(prev, 30));
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 2));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  // Get task position and width on timeline
  const getTaskGeometry = (task: CentralTask) => {
    if (!task.start_date || !task.end_date) return null;
    
    const taskStart = new Date(task.start_date);
    const taskEnd = new Date(task.end_date);
    
    const startOffset = differenceInDays(taskStart, startDate);
    const duration = differenceInDays(taskEnd, taskStart) + 1;
    
    return {
      left: Math.max(0, startOffset * dayWidth),
      width: Math.max(dayWidth, duration * dayWidth),
      visible: taskStart <= endDate && taskEnd >= startDate
    };
  };

  // Filter tasks to show only visible ones
  const visibleTasks = tasks.filter(task => {
    const geometry = getTaskGeometry(task);
    return geometry?.visible;
  });

  // Render timeline header with dates
  const renderTimelineHeader = () => {
    const months = [];
    const weeks = [];
    
    // Group days by month and week for header
    let currentMonth = '';
    let monthStart = 0;
    let monthWidth = 0;
    
    days.forEach((day, index) => {
      const monthStr = format(day, 'MMM yyyy');
      if (monthStr !== currentMonth) {
        if (currentMonth) {
          months.push({
            month: currentMonth,
            left: monthStart * dayWidth,
            width: monthWidth * dayWidth
          });
        }
        currentMonth = monthStr;
        monthStart = index;
        monthWidth = 1;
      } else {
        monthWidth++;
      }
    });
    
    // Add the last month
    if (currentMonth) {
      months.push({
        month: currentMonth,
        left: monthStart * dayWidth,
        width: monthWidth * dayWidth
      });
    }

    return (
      <div className="border-b border-border">
        {/* Month headers */}
        <div className="relative h-8 bg-muted/30 border-b border-border">
          {months.map((month, index) => (
            <div
              key={index}
              className="absolute top-0 h-full flex items-center justify-center text-xs font-medium border-r border-border/50"
              style={{
                left: month.left,
                width: month.width
              }}
            >
              {month.month}
            </div>
          ))}
        </div>
        
        {/* Day numbers */}
        <div className="relative h-6 bg-background border-b border-border">
          {days.map((day, index) => (
            <div
              key={index}
              className="absolute top-0 h-full flex items-center justify-center text-xs text-muted-foreground border-r border-border/30"
              style={{
                left: index * dayWidth,
                width: dayWidth
              }}
            >
              {format(day, 'd')}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render task bars on timeline
  const renderTaskBars = () => {
    return visibleTasks.map(task => {
      const geometry = getTaskGeometry(task);
      if (!geometry) return null;

      const isStage = task.level === 0 || !task.parent_id;
      const progress = task.progress || 0;

      return (
        <div
          key={task.id}
          className={cn(
            "absolute h-6 rounded-sm border",
            isStage 
              ? "bg-primary border-primary text-primary-foreground" 
              : "bg-blue-500 border-blue-600 text-white"
          )}
          style={{
            left: geometry.left,
            width: geometry.width,
            top: tasks.indexOf(task) * 32 + 8
          }}
        >
          {/* Progress bar */}
          <div 
            className="h-full bg-background/20 rounded-sm transition-all"
            style={{ width: `${progress}%` }}
          />
          
          {/* Task name */}
          <div className="absolute inset-0 flex items-center px-2 text-xs font-medium truncate">
            {task.name.length > 15 ? `${task.name.slice(0, 12)}...` : task.name}
          </div>
        </div>
      );
    });
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{projectTitle}</CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Navigation */}
            <Button variant="outline" size="sm" onClick={goToPrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-24 text-center">
              {format(currentDate, 'MMM yyyy')}
            </span>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            {/* Zoom controls */}
            <div className="border-l pl-2 ml-2">
              <Button variant="outline" size="sm" onClick={zoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={zoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="flex h-96 border-t border-border">
          {/* Task List Section */}
          <div 
            className="border-r border-border bg-background"
            style={{ width: taskListWidth }}
          >
            <GanttTaskList 
              tasks={tasks}
              onTaskUpdate={onTaskUpdate}
              className="h-full border-0 rounded-none"
            />
          </div>
          
          {/* Resizable Divider */}
          <div 
            className="w-1 bg-border cursor-col-resize hover:bg-primary/50 transition-colors"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
            }}
          />
          
          {/* Timeline Section */}
          <div className="flex-1 overflow-x-auto">
            <div style={{ width: Math.max(timelineWidth, 800) }}>
              {/* Timeline Header */}
              {renderTimelineHeader()}
              
              {/* Timeline Content */}
              <div 
                className="relative bg-background"
                style={{ height: tasks.length * 32 + 16 }}
              >
                {/* Grid lines */}
                {days.map((_, index) => (
                  <div
                    key={index}
                    className="absolute top-0 bottom-0 border-r border-border/20"
                    style={{ left: index * dayWidth }}
                  />
                ))}
                
                {/* Task bars */}
                {renderTaskBars()}
                
                {/* Today line */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                  style={{ 
                    left: differenceInDays(new Date(), startDate) * dayWidth 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};