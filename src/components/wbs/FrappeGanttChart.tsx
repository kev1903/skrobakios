import React, { useEffect, useRef, useMemo } from 'react';
import Gantt from 'frappe-gantt';

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
  viewMode?: 'day' | 'week' | 'month';
  showCriticalPath?: boolean;
}

export const FrappeGanttChart = ({ 
  items, 
  onDateChange, 
  onProgressChange,
  viewMode = 'day',
  showCriticalPath = false
}: FrappeGanttChartProps) => {
  const ganttRef = useRef<HTMLDivElement>(null);
  const ganttInstance = useRef<any>(null);

  // Memoize task conversion to prevent unnecessary recalculations
  const tasks = useMemo(() => {
    console.log('🔵 FrappeGanttChart received items:', items.length, items);
    
    const convertToGanttTasks = (items: any[]): GanttTask[] => {
    const today = new Date();
    const defaultStart = today.toISOString().split('T')[0];
    const defaultEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const filtered = items.filter(item => !item.id.startsWith('empty-'));
    console.log('🔵 FrappeGanttChart after filtering empty rows:', filtered.length);
    
    return filtered.map(item => {
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

        const task = {
          id: item.id,
          name: item.title || item.name || 'Untitled Task',
          start: startDate,
          end: endDate,
          progress: item.progress || 0,
          dependencies: item.predecessors?.join(',') || '',
          custom_class: `level-${item.level || 0}`
        };
        
        console.log('🔵 FrappeGanttChart converted task:', task);
        return task;
      });
    };
    
    const result = convertToGanttTasks(items);
    console.log('🔵 FrappeGanttChart final tasks:', result.length, result);
    return result;
  }, [items]);

  useEffect(() => {
    console.log('🔵 FrappeGanttChart useEffect - items:', items.length, 'tasks:', tasks.length);
    
    if (!ganttRef.current) {
      console.log('❌ No ganttRef.current');
      return;
    }
    
    if (items.length === 0) {
      console.log('⚠️ No items provided');
      ganttRef.current.innerHTML = '<div class="p-8 text-center text-slate-500">No activities to display</div>';
      return;
    }

    try {
      if (tasks.length === 0) {
        console.log('⚠️ No tasks after conversion');
        ganttRef.current.innerHTML = '<div class="p-8 text-center text-slate-500">No tasks to display</div>';
        return;
      }

      // Destroy existing instance
      if (ganttInstance.current) {
        ganttInstance.current = null;
      }

      // Clear the container
      ganttRef.current.innerHTML = '';

      // Map view mode to Frappe Gantt view mode
      const frappeViewMode = viewMode === 'day' ? 'Day' : viewMode === 'week' ? 'Week' : 'Month';
      
      console.log('🔵 Creating Gantt chart with', tasks.length, 'tasks, viewMode:', frappeViewMode);
      
      // Create new Gantt chart configured for exact 28px row alignment
      ganttInstance.current = new Gantt(ganttRef.current, tasks, {
        header_height: 50,
        column_width: viewMode === 'day' ? 32 : viewMode === 'week' ? 120 : 200,
        step: 24,
        bar_height: 20,
        bar_corner_radius: 3,
        arrow_curve: 5,
        padding: 18,
        date_format: 'YYYY-MM-DD',
        view_mode: frappeViewMode,
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
      
      console.log('✅ Gantt chart created successfully');

    } catch (error) {
      console.error('❌ Error creating Gantt chart:', error);
      if (ganttRef.current) {
        ganttRef.current.innerHTML = `<div class="p-8 text-center text-red-500">Error loading Gantt chart: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
      }
    }

    return () => {
      if (ganttInstance.current) {
        ganttInstance.current = null;
      }
    };
  }, [tasks, onDateChange, onProgressChange, viewMode]);

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
        /* Professional Gantt Chart Styling */
        .gantt-container {
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
          font-size: 11px !important;
        }
        
        /* Enhanced Header styling - Professional PM Tool Look */
        .gantt .grid-header {
          height: 50px !important;
          fill: #f8fafc !important;
        }
        
        .gantt .grid-header text {
          font-size: 10px !important;
          font-weight: 600 !important;
          fill: #475569 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        
        /* Month/Day header rows */
        .gantt .upper-text {
          font-size: 11px !important;
          font-weight: 600 !important;
          fill: #1e293b !important;
        }
        
        .gantt .lower-text {
          font-size: 9px !important;
          font-weight: 500 !important;
          fill: #64748b !important;
        }
        
        /* Grid rows - Enhanced 28px height */
        .gantt .grid-row {
          height: 28px !important;
          min-height: 28px !important;
          max-height: 28px !important;
        }
        
        /* Bar wrappers - 28px container */
        .gantt .bar-wrapper {
          height: 28px !important;
          min-height: 28px !important;
          max-height: 28px !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        
        /* Task bars - Professional styling with status-based colors */
        .gantt .bar {
          height: 20px !important;
          transform: translateY(4px) !important;
          border-radius: 3px !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
        }
        
        /* Bar labels - minimal */
        .gantt .bar-label {
          font-size: 9px !important;
          line-height: 20px !important;
          font-weight: 500 !important;
          fill: white !important;
        }
        
        /* Progress bar */
        .gantt .bar-progress {
          height: 20px !important;
          border-radius: 3px !important;
          fill: #059669 !important;
          opacity: 0.85 !important;
        }
        
        /* Professional status-based colors */
        .gantt .bar.level-0 {
          fill: #64748b !important;
          stroke: #475569 !important;
          stroke-width: 1.5 !important;
        }
        .gantt .bar.level-1 {
          fill: #2563eb !important;
          stroke: #1e40af !important;
          stroke-width: 1.5 !important;
        }
        .gantt .bar.level-2 {
          fill: #3b82f6 !important;
          stroke: #2563eb !important;
          stroke-width: 1.5 !important;
        }
        .gantt .bar.level-3 {
          fill: #60a5fa !important;
          stroke: #3b82f6 !important;
          stroke-width: 1.5 !important;
        }
        
        /* Resize handles - Professional */
        .gantt .handle {
          fill: #475569 !important;
          opacity: 0.5 !important;
          cursor: ew-resize !important;
        }
        
        .gantt .handle:hover {
          opacity: 1 !important;
          fill: #1e293b !important;
        }
        
        /* Grid background - Clean white */
        .gantt .grid-background {
          fill: #ffffff !important;
        }
        
        /* Grid lines - Subtle professional borders */
        .gantt .tick {
          stroke: #e2e8f0 !important;
          stroke-width: 1 !important;
        }
        
        .gantt .grid-row {
          stroke: #f1f5f9 !important;
          stroke-width: 1 !important;
        }
        
        /* Today marker - Prominent */
        .gantt .today-highlight {
          fill: #3b82f6 !important;
          opacity: 0.15 !important;
        }
        
        /* Show task labels on hover */
        .gantt .bar-wrapper:hover .bar-label {
          display: block !important;
        }
        
        /* Enhanced Popup styling - Professional */
        .details-container {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
          padding: 16px !important;
          font-family: Inter, sans-serif !important;
          min-width: 200px !important;
        }
        
        .details-container h5 {
          font-size: 14px !important;
          font-weight: 600 !important;
          margin: 0 0 12px 0 !important;
          color: #0f172a !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding-bottom: 8px !important;
        }
        
        .details-container p {
          font-size: 12px !important;
          margin: 6px 0 !important;
          color: #475569 !important;
          line-height: 1.5 !important;
        }
        
        /* Dependency arrows - Enhanced visibility */
        .gantt .arrow {
          stroke: #3b82f6 !important;
          stroke-width: 1.5 !important;
          fill: none !important;
        }
        
        .gantt .arrow-head {
          fill: #3b82f6 !important;
        }
      `}</style>
    </div>
  );
};