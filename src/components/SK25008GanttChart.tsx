import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  const getProjectStart = () => {
    if (tasks.length === 0) return new Date();
    return new Date(Math.min(...tasks.map(t => new Date(t.start_date).getTime())));
  };

  const getProjectEnd = () => {
    if (tasks.length === 0) return new Date();
    return new Date(Math.max(...tasks.map(t => new Date(t.end_date).getTime())));
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
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'delayed':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-AU', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No tasks available for timeline view
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="flex justify-between text-sm text-muted-foreground mb-4">
        <span>{formatDate(projectStart.toISOString())}</span>
        <span>{totalDays} days total</span>
        <span>{formatDate(projectEnd.toISOString())}</span>
      </div>

      {/* Timeline Grid */}
      <div className="relative">
        {/* Week markers */}
        <div className="absolute top-0 left-0 right-0 h-2 border-b flex">
          {Array.from({ length: Math.ceil(totalDays / 7) }, (_, i) => (
            <div 
              key={i}
              className="border-r border-gray-200 flex-1 text-xs text-center"
              style={{ minWidth: '60px' }}
            >
              W{i + 1}
            </div>
          ))}
        </div>

        {/* Tasks */}
        <div className="mt-8 space-y-3">
          {tasks.map((task, index) => {
            const position = getTaskPosition(task);
            
            return (
              <div key={task.id} className="relative">
                <div className="flex items-center h-12">
                  <div className="w-40 text-sm font-medium truncate pr-4">
                    {task.task_name}
                  </div>
                  
                  <div className="flex-1 relative h-8 bg-gray-100 rounded">
                    <div
                      className={`absolute h-full rounded ${getStatusColor(task.status)} opacity-80 flex items-center px-2`}
                      style={position}
                    >
                      <span className="text-white text-xs font-medium">
                        {task.progress_percentage}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-24 text-right">
                    <Badge 
                      variant={task.status === 'complete' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {task.status}
                    </Badge>
                  </div>
                </div>
                
                {/* Task details */}
                <div className="ml-44 text-xs text-muted-foreground">
                  {formatDate(task.start_date)} - {formatDate(task.end_date)} ({task.duration_days} days)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Critical Path Notice */}
      <Card className="mt-6 border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="text-sm text-amber-800">
            <strong>Critical Path:</strong> Concept Design → Detailed Design → Review and Approval
            <br />
            <span className="text-amber-700">
              Any delays in these tasks will impact the final delivery date.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};