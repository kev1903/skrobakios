import React, { useEffect, useRef } from 'react';
import { WBSItem } from '@/types/wbs';
import { transformWBSToJSGantt } from '@/utils/jsganttUtils';

interface JSGanttChartProps {
  tasks: WBSItem[];
  onTaskUpdate?: (taskId: string, updates: Partial<WBSItem>) => void;
  loading?: boolean;
}

// Custom Gantt chart implementation using HTML5 Canvas
const drawGanttChart = (canvas: HTMLCanvasElement, tasks: WBSItem[]) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Set up dimensions
  const rowHeight = 40;
  const headerHeight = 60;
  const taskListWidth = 300;
  const timelineWidth = canvas.width - taskListWidth;
  
  // Flatten tasks for rendering
  const flatTasks = transformWBSToJSGantt(tasks);
  
  // Calculate date range
  const now = new Date();
  const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const endDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days from now
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  const dayWidth = timelineWidth / totalDays;

  // Draw header
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, canvas.width, headerHeight);
  
  // Draw header text
  ctx.fillStyle = '#495057';
  ctx.font = '14px Inter';
  ctx.fillText('Task', 10, 30);
  ctx.fillText('Timeline', taskListWidth + 10, 30);
  
  // Draw timeline grid
  ctx.strokeStyle = '#e9ecef';
  ctx.lineWidth = 1;
  
  // Vertical grid lines (days)
  for (let i = 0; i <= totalDays; i += 7) { // Weekly grid
    const x = taskListWidth + (i * dayWidth);
    ctx.beginPath();
    ctx.moveTo(x, headerHeight);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  
  // Draw tasks
  flatTasks.forEach((task, index) => {
    const y = headerHeight + (index * rowHeight);
    
    // Draw task row background
    ctx.fillStyle = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
    ctx.fillRect(0, y, canvas.width, rowHeight);
    
    // Draw task name
    ctx.fillStyle = '#495057';
    ctx.font = '12px Inter';
    ctx.fillText(task.pName.substring(0, 30), 10, y + 25);
    
    // Draw task bar if it has dates
    if (task.pStart && task.pEnd) {
      const taskStart = new Date(task.pStart);
      const taskEnd = new Date(task.pEnd);
      
      if (taskStart >= startDate && taskStart <= endDate) {
        const startX = taskListWidth + ((taskStart.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) * dayWidth;
        const endX = taskListWidth + ((taskEnd.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) * dayWidth;
        const barWidth = Math.max(endX - startX, 2);
        
        // Task bar color based on status
        let barColor = '#6c757d'; // default gray
        switch (task.pStatus) {
          case 'Completed':
            barColor = '#28a745';
            break;
          case 'In Progress':
            barColor = '#007bff';
            break;
          case 'Delayed':
            barColor = '#dc3545';
            break;
          case 'On Hold':
            barColor = '#ffc107';
            break;
        }
        
        // Draw task bar
        ctx.fillStyle = barColor;
        ctx.fillRect(startX, y + 10, barWidth, 20);
        
        // Draw progress overlay
        if (task.pComp > 0) {
          ctx.fillStyle = barColor + '80'; // semi-transparent
          ctx.fillRect(startX, y + 10, (barWidth * task.pComp / 100), 20);
        }
        
        // Draw task text on bar
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Inter';
        const progressText = `${task.pComp}%`;
        ctx.fillText(progressText, startX + 5, y + 25);
      }
    }
    
    // Draw horizontal grid line
    ctx.strokeStyle = '#e9ecef';
    ctx.beginPath();
    ctx.moveTo(0, y + rowHeight);
    ctx.lineTo(canvas.width, y + rowHeight);
    ctx.stroke();
  });
  
  // Draw vertical separator between task list and timeline
  ctx.strokeStyle = '#dee2e6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(taskListWidth, 0);
  ctx.lineTo(taskListWidth, canvas.height);
  ctx.stroke();
};

export const JSGanttChart: React.FC<JSGanttChartProps> = ({ 
  tasks, 
  onTaskUpdate,
  loading = false 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Redraw chart when tasks change
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container || loading) return;
    
    // Set canvas size to match container
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = Math.max(400, tasks.length * 40 + 100);
      drawGanttChart(canvas, tasks);
    };
    
    resizeCanvas();
    
    // Redraw on window resize
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [tasks, loading]);

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

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground mb-2">No tasks found</p>
          <p className="text-sm text-muted-foreground">Add some tasks to your project to see the timeline</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full w-full bg-background">
      <div className="h-full overflow-auto">
        <canvas 
          ref={canvasRef}
          className="w-full border border-border rounded-lg"
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
};