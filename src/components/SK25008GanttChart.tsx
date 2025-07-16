import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { Wifi, WifiOff, RotateCcw } from 'lucide-react';

interface Task {
  id: string;
  task_name: string;
  task_type: string;
  status: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  progress_percentage: number;
}

interface SK25008GanttChartProps {
  tasks: Task[];
}

export const SK25008GanttChart: React.FC<SK25008GanttChartProps> = ({ tasks }) => {
  const [liveTasks, setLiveTasks] = useState(tasks);

  // Handle real-time updates
  const handleRealtimeUpdate = (table: string, payload: any) => {
    console.log('Gantt chart received real-time update:', { table, payload });
    
    if (payload.eventType === 'INSERT') {
      const newTask = payload.new;
      setLiveTasks(prev => {
        if (prev.some(t => t.id === newTask.id)) return prev;
        return [...prev, newTask];
      });
    } else if (payload.eventType === 'UPDATE') {
      const updatedTask = payload.new;
      setLiveTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
    } else if (payload.eventType === 'DELETE') {
      setLiveTasks(prev => prev.filter(task => task.id !== payload.old.id));
    }
  };

  // Set up real-time sync for SK project
  const { isConnected, isRetrying, forceResync } = useRealtimeSync({
    tables: ['sk_25008_design'],
    onUpdate: handleRealtimeUpdate,
    retryCount: 3,
    retryDelay: 2000
  });

  // Update liveTasks when props change
  useEffect(() => {
    setLiveTasks(tasks);
  }, [tasks]);

  const getProjectStart = () => {
    if (liveTasks.length === 0) return new Date();
    return new Date(Math.min(...liveTasks.map(t => new Date(t.start_date).getTime())));
  };

  const getProjectEnd = () => {
    if (liveTasks.length === 0) return new Date();
    return new Date(Math.max(...liveTasks.map(t => new Date(t.end_date).getTime())));
  };

  const projectStart = getProjectStart();
  const projectEnd = getProjectEnd();
  const totalDays = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));

  const getTaskPosition = (task: Task) => {
    const taskStart = new Date(task.start_date);
    const startOffset = Math.ceil((taskStart.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
    const left = (startOffset / totalDays) * 100;
    const width = (task.duration_days / totalDays) * 100;
    
    return { left: `${left}%`, width: `${width}%` };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-emerald-500';
      case 'in-progress':
        return 'bg-cyan-500';
      case 'delayed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-slate-300';
      default:
        return 'bg-slate-300';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-slate-800 text-white';
      case 'pending':
        return 'bg-slate-200 text-slate-700';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-AU', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (liveTasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No tasks available for timeline view
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Project Timeline</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Visual timeline with critical path and dependencies
            </p>
          </div>
          
          {/* Sync Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center space-x-1 text-green-600">
                <Wifi className="w-4 h-4" />
                <span className="text-xs">Live Updates</span>
              </div>
            ) : isRetrying ? (
              <div className="flex items-center space-x-1 text-yellow-600">
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span className="text-xs">Reconnecting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-600 cursor-pointer" onClick={forceResync}>
                <WifiOff className="w-4 h-4" />
                <span className="text-xs">Offline</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="p-6">
        {/* Timeline Header */}
        <div className="flex justify-between items-center text-sm text-muted-foreground mb-6">
          <span>{formatDate(projectStart.toISOString())}</span>
          <span className="font-medium">{totalDays} days total</span>
          <span>{formatDate(projectEnd.toISOString())}</span>
        </div>

        {/* Timeline Grid with connecting lines */}
        <div className="relative">
          {/* Background grid */}
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full" style={{ height: `${tasks.length * 80 + 60}px` }}>
              {/* Curved connecting lines */}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#06b6d4" />
                </marker>
              </defs>
              {liveTasks.map((task, index) => {
                if (index < liveTasks.length - 1) {
                  const startY = 60 + (index * 80) + 20;
                  const endY = 60 + ((index + 1) * 80) + 20;
                  const midX = "50%";
                  
                  return (
                    <path
                      key={`line-${index}`}
                      d={`M 80% ${startY} Q ${midX} ${startY + 30} 20% ${endY}`}
                      stroke="#06b6d4"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                      className="opacity-60"
                    />
                  );
                }
                return null;
              })}
            </svg>
          </div>

          {/* Week markers */}
          <div className="flex border-b border-border h-8 mb-4">
            {Array.from({ length: Math.ceil(totalDays / 7) }, (_, i) => (
              <div 
                key={i}
                className="flex-1 text-xs text-center text-muted-foreground font-medium py-2"
                style={{ minWidth: '60px' }}
              >
                W{i + 1}
              </div>
            ))}
          </div>

          {/* Tasks */}
          <div className="space-y-4 relative z-10">
            {liveTasks.map((task, index) => {
              const position = getTaskPosition(task);
              
              return (
                <div key={task.id} className="relative h-16">
                  <div className="flex items-center h-full">
                    {/* Task Name */}
                    <div className="w-48 pr-6">
                      <h4 className="font-medium text-foreground text-sm leading-tight">
                        {task.task_name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(task.start_date)} - {formatDate(task.end_date)} ({task.duration_days} days)
                      </p>
                    </div>
                    
                    {/* Timeline Bar */}
                    <div className="flex-1 relative">
                      <div className="h-8 bg-muted rounded-lg relative overflow-hidden">
                        <div
                          className={`absolute h-full rounded-lg ${getStatusColor(task.status)} transition-all duration-300 flex items-center px-3`}
                          style={position}
                        >
                          <span className="text-white text-xs font-medium">
                            {task.progress_percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="w-28 flex justify-end pl-4">
                      <Badge 
                        className={`text-xs px-3 py-1 rounded-full ${getStatusBadgeColor(task.status)}`}
                      >
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Critical Path Notice */}
        <Card className="mt-8 border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
              <div className="text-sm">
                <div className="font-medium text-amber-900 mb-1">
                  Critical Path: Concept Design → Detailed Design → Review and Approval
                </div>
                <div className="text-amber-800">
                  Any delays in these tasks will impact the final delivery date.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};