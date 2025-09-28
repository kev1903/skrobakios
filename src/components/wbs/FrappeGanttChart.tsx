import React, { useEffect, useRef } from 'react';
import * as FrappeGantt from 'frappe-gantt';

interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies?: string;
  custom_class?: string;
}

interface FrappeGanttChartProps {
  items: any[];
  onDateChange?: (task: any, start: Date, end: Date) => void;
  onProgressChange?: (task: any, progress: number) => void;
}

export const FrappeGanttChart = ({ 
  items, 
  onDateChange, 
  onProgressChange 
}: FrappeGanttChartProps) => {
  const ganttRef = useRef<HTMLDivElement>(null);
  const ganttInstance = useRef<any>(null);

  // Convert WBS items to Gantt tasks
  const convertToGanttTasks = (items: any[]): GanttTask[] => {
    const today = new Date();
    const defaultStart = today.toISOString().split('T')[0];
    const defaultEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return items
      .filter(item => !item.id.startsWith('empty-')) // Filter out empty rows
      .map(item => {
        // Format dates properly
        let startDate = defaultStart;
        let endDate = defaultEnd;

        if (item.start_date) {
          if (typeof item.start_date === 'string') {
            startDate = item.start_date.split('T')[0];
          } else if (item.start_date instanceof Date) {
            startDate = item.start_date.toISOString().split('T')[0];
          }
        }

        if (item.end_date) {
          if (typeof item.end_date === 'string') {
            endDate = item.end_date.split('T')[0];
          } else if (item.end_date instanceof Date) {
            endDate = item.end_date.toISOString().split('T')[0];
          }
        }

        // Ensure end date is after start date
        if (new Date(endDate) <= new Date(startDate)) {
          endDate = new Date(new Date(startDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        }

        return {
          id: item.id,
          name: item.title || item.name || 'Untitled Task',
          start: startDate,
          end: endDate,
          progress: item.progress || 0,
          dependencies: item.predecessors?.join(',') || '',
          custom_class: `level-${item.level || 0}`
        };
      });
  };

  useEffect(() => {
    if (!ganttRef.current || items.length === 0) return;

    try {
      const tasks = convertToGanttTasks(items);
      
      if (tasks.length === 0) {
        // Show empty state
        ganttRef.current.innerHTML = '<div class="p-8 text-center text-gray-500">No tasks to display</div>';
        return;
      }

      // Destroy existing instance
      if (ganttInstance.current) {
        ganttInstance.current = null;
      }

      // Clear the container
      ganttRef.current.innerHTML = '';

      // Create new Gantt chart
      ganttInstance.current = new (FrappeGantt as any).default(ganttRef.current, tasks, {
        header_height: 50,
        column_width: 30,
        step: 24,
        view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
        bar_height: 20,
        bar_corner_radius: 3,
        arrow_curve: 5,
        padding: 18,
        view_mode: 'Day',
        date_format: 'YYYY-MM-DD',
        custom_popup_html: function(task: any) {
          return `
            <div class="details-container">
              <h5>${task.name}</h5>
              <p>Expected to finish by ${task._end.toDateString()}</p>
              <p>Progress: ${task.progress}%</p>
            </div>
          `;
        },
        on_click: function (task: any) {
          console.log('Gantt task clicked:', task);
        },
        on_date_change: function (task: any, start: Date, end: Date) {
          console.log('Gantt date change:', task, start, end);
          if (onDateChange) {
            onDateChange(task, start, end);
          }
        },
        on_progress_change: function (task: any, progress: number) {
          console.log('Gantt progress change:', task, progress);
          if (onProgressChange) {
            onProgressChange(task, progress);
          }
        },
        on_view_change: function (mode: string) {
          console.log('Gantt view changed to:', mode);
        }
      });

    } catch (error) {
      console.error('Error creating Gantt chart:', error);
      if (ganttRef.current) {
        ganttRef.current.innerHTML = '<div class="p-8 text-center text-red-500">Error loading Gantt chart</div>';
      }
    }

    return () => {
      if (ganttInstance.current) {
        ganttInstance.current = null;
      }
    };
  }, [items, onDateChange, onProgressChange]);

  return (
    <div className="h-full w-full overflow-auto bg-white">
      <div ref={ganttRef} className="min-h-full" />
      <style>{`
        .gantt .grid-row {
          border-bottom: 1px solid #e5e7eb;
        }
        .gantt .grid-header {
          background-color: #f8fafc;
          border-bottom: 2px solid #e5e7eb;
        }
        .gantt .bar {
          fill: #3b82f6;
        }
        .gantt .bar.level-0 {
          fill: #1e40af;
        }
        .gantt .bar.level-1 {
          fill: #3b82f6;
        }
        .gantt .bar.level-2 {
          fill: #60a5fa;
        }
        .gantt .bar.level-3 {
          fill: #93c5fd;
        }
        .gantt .bar.level-4 {
          fill: #bfdbfe;
        }
        .gantt .bar-progress {
          fill: #10b981;
        }
        .gantt .handle.right {
          fill: #6b7280;
        }
        .gantt .handle.left {
          fill: #6b7280;
        }
      `}</style>
    </div>
  );
};