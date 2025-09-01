import React, { useEffect, useRef } from 'react';
import { WBSItem } from '@/types/wbs';
import Gantt from 'frappe-gantt';
import '@/styles/gantt.css';

interface JSGanttChartProps {
  tasks: WBSItem[];
  onTaskUpdate?: (taskId: string, updates: Partial<WBSItem>) => void;
  loading?: boolean;
}

export const JSGanttChart: React.FC<JSGanttChartProps> = ({ 
  tasks, 
  onTaskUpdate,
  loading = false 
}) => {
  const ganttRef = useRef<HTMLDivElement>(null);
  const ganttInstance = useRef<any>(null);

  // Debug logging
  console.log('JSGanttChart render:', { 
    tasksCount: tasks?.length || 0, 
    loading, 
    hasGanttRef: !!ganttRef.current,
    tasks: tasks?.slice(0, 2) // Log first 2 tasks for debugging
  });

  // Convert WBS tasks to Frappe Gantt format
  const convertToFrappeFormat = (wbsItems: WBSItem[]) => {
    console.log('Converting WBS items to Frappe format:', wbsItems?.length);
    return wbsItems.map(item => ({
      id: item.id,
      name: item.title || 'Untitled Task',
      start: item.start_date || new Date().toISOString().split('T')[0],
      end: item.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: item.progress || 0,
      dependencies: item.linked_tasks?.join(',') || ''
    }));
  };

  // Initialize/update Gantt chart
  useEffect(() => {
    console.log('Gantt useEffect triggered:', { 
      hasRef: !!ganttRef.current, 
      loading, 
      tasksLength: tasks?.length 
    });
    
    if (!ganttRef.current || loading) {
      console.log('Gantt useEffect early return:', { hasRef: !!ganttRef.current, loading });
      return;
    }

    // Show empty state if no tasks, but also try with sample data
    if (!tasks || tasks.length === 0) {
      console.log('No tasks found, using sample data');
      // Create sample data for testing
      const sampleTasks = [
        {
          id: 'sample-1',
          name: 'Sample Task 1',
          start: new Date().toISOString().split('T')[0],
          end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          progress: 30,
          dependencies: ''
        },
        {
          id: 'sample-2', 
          name: 'Sample Task 2',
          start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          progress: 60,
          dependencies: ''
        }
      ];
      
      try {
        console.log('Initializing Gantt with sample data');
        ganttInstance.current = new Gantt(ganttRef.current, sampleTasks, {
          view_mode: 'Week',
          date_format: 'YYYY-MM-DD',
          bar_height: 20,
          bar_corner_radius: 3,
          arrow_curve: 5,
          padding: 18,
          view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month']
        });
        console.log('Gantt initialized successfully with sample data');
      } catch (error) {
        console.error('Error initializing Gantt with sample data:', error);
      }
      return;
    }
    
    try {
      const ganttTasks = convertToFrappeFormat(tasks);
      console.log('Converted tasks for Gantt:', ganttTasks);
      
      if (ganttInstance.current) {
        console.log('Refreshing existing Gantt instance');
        ganttInstance.current.refresh(ganttTasks);
      } else {
        console.log('Creating new Gantt instance');
        ganttInstance.current = new Gantt(ganttRef.current, ganttTasks, {
          view_mode: 'Week',
          date_format: 'YYYY-MM-DD',
          bar_height: 20,
          bar_corner_radius: 3,
          arrow_curve: 5,
          padding: 18,
          view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
          custom_popup_html: (task: any) => {
            return `
              <div class="details-container">
                <h5>${task.name}</h5>
                <p>Progress: ${task.progress}%</p>
                <p>${task.start} - ${task.end}</p>
              </div>
            `;
          },
          on_click: (task: any) => {
            console.log('Task clicked:', task);
          },
          on_progress_change: (task: any, progress: number) => {
            if (onTaskUpdate) {
              onTaskUpdate(task.id, { progress });
            }
          }
        });
        console.log('Gantt instance created successfully');
      }
    } catch (error) {
      console.error('Error initializing Gantt chart:', error);
    }
    
    return () => {
      if (ganttInstance.current) {
        ganttInstance.current = null;
      }
    };
  }, [tasks, loading, onTaskUpdate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading timeline...</p>
        </div>
      </div>
    );
  }

  // Also add debug for empty state display
  if (!tasks || tasks.length === 0) {
    console.log('Showing empty state - no tasks available');
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground mb-2">No tasks found</p>
          <p className="text-sm text-muted-foreground">Add some tasks to your project to see the timeline</p>
          <p className="text-xs text-muted-foreground mt-2">Debug: Sample chart should show above if Gantt works</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background">
      <div className="h-full overflow-auto p-4">
        <div 
          ref={ganttRef}
          className="w-full min-h-[400px] border border-border rounded-lg"
        />
      </div>
    </div>
  );
};