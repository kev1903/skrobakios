import React, { useEffect, useRef, useMemo } from 'react';
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

  // Memoize task conversion to prevent unnecessary recalculations
  const tasks = useMemo(() => {
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
    
    return convertToGanttTasks(items);
  }, [items]);

  useEffect(() => {
    if (!ganttRef.current || items.length === 0) return;

    try {
      
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

      // Create new Gantt chart with proper configuration
      ganttInstance.current = new (FrappeGantt as any).default(ganttRef.current, tasks, {
        header_height: 56, // Two rows: month + day
        column_width: 32, // Wider columns for better visibility
        step: 24,
        bar_height: 22, // Slightly larger bar
        bar_corner_radius: 4,
        arrow_curve: 5,
        padding: 18, // Standard padding
        date_format: 'YYYY-MM-DD',
        view_mode: 'Day',
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
  }, [tasks, onDateChange, onProgressChange]);

  useEffect(() => {
    // Add CDN CSS for frappe-gantt since the npm package doesn't include it
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.css';
    link.id = 'frappe-gantt-css';
    
    // Only add if not already present
    if (!document.getElementById('frappe-gantt-css')) {
      document.head.appendChild(link);
    }

    return () => {
      // Cleanup on unmount
      const existingLink = document.getElementById('frappe-gantt-css');
      if (existingLink) {
        document.head.removeChild(existingLink);
      }
    };
  }, []);

  return (
    <div className="h-full w-full overflow-auto bg-white">
      <div ref={ganttRef} className="min-h-full" />
      <style>{`
        /* Frappe Gantt customization for 28px row alignment */
        .gantt-container {
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        }
        
        /* Grid rows - exact 28px height to match data table */
        .gantt .grid-row {
          height: 28px !important;
          line-height: 28px !important;
        }
        
        /* Bar wrappers - 28px container height */
        .gantt .bar-wrapper {
          height: 28px !important;
          padding: 0 !important;
        }
        
        /* Bars - 22px height centered in 28px row (3px top/bottom margin) */
        .gantt .bar {
          height: 22px !important;
          margin-top: 3px !important;
          margin-bottom: 3px !important;
        }
        
        /* Bar labels */
        .gantt .bar-label {
          font-size: 11px !important;
          line-height: 22px !important;
        }
        
        /* Progress bars */
        .gantt .bar-progress {
          height: 22px !important;
        }
        
        /* Level-based colors */
        .gantt .bar.level-0 {
          fill: #cbd5e1 !important;
          stroke: #94a3b8 !important;
        }
        .gantt .bar.level-1 {
          fill: #3b82f6 !important;
        }
        .gantt .bar.level-2 {
          fill: #60a5fa !important;
        }
        .gantt .bar.level-3 {
          fill: #93c5fd !important;
        }
        
        /* Progress color */
        .gantt .bar-progress {
          fill: #10b981 !important;
        }
        
        /* Handles */
        .gantt .handle {
          fill: #6b7280 !important;
          opacity: 0.8 !important;
        }
        
        /* Grid header */
        .gantt .grid-header {
          fill: #f9fafb !important;
        }
        
        /* Grid lines */
        .gantt .grid-background .grid-row {
          stroke: #e5e7eb !important;
        }
        
        /* Today marker */
        .gantt .today-highlight {
          fill: #dbeafe !important;
          opacity: 0.3 !important;
        }
      `}</style>
    </div>
  );
};