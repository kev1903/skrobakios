
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface GanttTask {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  color: string;
  level: number;
  children?: GanttTask[];
  expanded?: boolean;
  type: 'milestone' | 'task' | 'group';
}

interface GanttChartProps {
  tasks: GanttTask[];
  startDate: Date;
  endDate: Date;
}

export const GanttChart = ({ tasks, startDate, endDate }: GanttChartProps) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set(['planning', 'site-amenities']));

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getDaysInRange = () => {
    const days = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const getWeeks = () => {
    const weeks = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      const weekStart = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weeks.push({ start: weekStart, end: weekEnd });
      current.setDate(current.getDate() + 7);
    }
    return weeks;
  };

  const getTaskPosition = (task: GanttTask) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const startDay = Math.ceil((taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return {
      left: `${(startDay / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
    };
  };

  const flattenTasks = (tasks: GanttTask[], parentExpanded = true): GanttTask[] => {
    const result: GanttTask[] = [];
    
    for (const task of tasks) {
      if (parentExpanded) {
        result.push(task);
        if (task.children && expandedTasks.has(task.id)) {
          result.push(...flattenTasks(task.children, true));
        }
      }
    }
    
    return result;
  };

  const weeks = getWeeks();
  const flatTasks = flattenTasks(tasks);

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex border-b border-gray-200">
        <div className="w-96 p-4 border-r border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900">Name</h3>
        </div>
        <div className="flex-1 bg-gray-50">
          <div className="flex">
            {weeks.map((week, index) => (
              <div key={index} className="flex-1 min-w-[200px] p-2 border-r border-gray-200 text-center">
                <div className="text-xs text-gray-600 mb-1">
                  W{Math.floor(index / 4) + 25} {week.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {week.end.toLocaleDateString('en-US', { day: 'numeric' })}
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const date = new Date(week.start);
                    date.setDate(date.getDate() + dayIndex);
                    return (
                      <span key={dayIndex} className="w-6 text-center">
                        {date.getDate()}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="relative">
        {flatTasks.map((task, index) => (
          <div key={task.id} className="flex border-b border-gray-100 hover:bg-gray-50">
            {/* Task Name Column */}
            <div className="w-96 p-3 border-r border-gray-200 flex items-center">
              <div className="flex items-center" style={{ marginLeft: `${task.level * 20}px` }}>
                {task.children && task.children.length > 0 && (
                  <button
                    onClick={() => toggleExpanded(task.id)}
                    className="mr-2 p-1 hover:bg-gray-200 rounded"
                  >
                    {expandedTasks.has(task.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
                {task.type === 'milestone' && (
                  <div className="w-3 h-3 bg-orange-400 rotate-45 mr-2"></div>
                )}
                {task.type === 'task' && (
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                )}
                <span className="text-sm text-gray-900 font-medium">{task.name}</span>
              </div>
            </div>

            {/* Timeline Column */}
            <div className="flex-1 relative h-12 bg-white">
              <div className="absolute inset-0 flex">
                {weeks.map((_, weekIndex) => (
                  <div key={weekIndex} className="flex-1 min-w-[200px] border-r border-gray-100">
                    <div className="h-full relative">
                      {/* Weekend shading */}
                      <div className="absolute right-0 top-0 w-[28.5%] h-full bg-gray-50 opacity-50"></div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Task Bar */}
              <div
                className="absolute top-2 h-8 rounded flex items-center px-2 text-xs text-white font-medium"
                style={{
                  ...getTaskPosition(task),
                  backgroundColor: task.color,
                  opacity: task.type === 'milestone' ? 0 : 1
                }}
              >
                {task.type !== 'milestone' && (
                  <>
                    <span className="truncate">{task.name}</span>
                    {task.progress > 0 && (
                      <div
                        className="absolute top-0 left-0 h-full bg-black bg-opacity-20 rounded"
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    )}
                  </>
                )}
              </div>

              {/* Milestone Diamond */}
              {task.type === 'milestone' && (
                <div
                  className="absolute top-4 w-4 h-4 rotate-45"
                  style={{
                    left: getTaskPosition(task).left,
                    backgroundColor: task.color
                  }}
                ></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
