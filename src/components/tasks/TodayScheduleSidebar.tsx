import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';
import { useTaskContext } from './useTaskContext';
import { getStatusColor } from './utils/taskUtils';

export const TodayScheduleSidebar = () => {
  const { tasks } = useTaskContext();
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Filter tasks due today
  const todayTasks = tasks.filter(task => task.dueDate === today);
  
  // Sort tasks by priority (High -> Medium -> Low)
  const sortedTasks = todayTasks.sort((a, b) => {
    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
    return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
           (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
  });

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-80 bg-white/95 backdrop-blur-xl border-l border-white/10 p-6 space-y-6 overflow-y-auto">
      {/* Header with date and time */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-slate-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">TODAY'S SCHEDULE</span>
        </div>
        <div className="space-y-1">
          <div className="text-lg font-semibold text-slate-800">{formatDate()}</div>
          <div className="flex items-center space-x-2 text-slate-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{formatTime()}</span>
          </div>
        </div>
      </div>

      {/* Tasks summary */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Today's Tasks</span>
            <Badge variant="outline" className="text-xs">
              {todayTasks.length} task{todayTasks.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedTasks.length > 0 ? (
            sortedTasks.map(task => (
              <div 
                key={task.id} 
                className="p-3 rounded-lg border border-white/20 bg-white/50 hover:bg-white/70 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm text-slate-800 leading-tight">
                      {task.taskName}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ml-2 ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{task.assignedTo.name}</span>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tasks scheduled for today</p>
              <p className="text-xs mt-1">Enjoy your free time!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick stats */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-lg bg-white/50">
              <div className="text-lg font-bold text-slate-800">
                {tasks.filter(t => t.status === 'Completed').length}
              </div>
              <div className="text-xs text-slate-600">Completed</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/50">
              <div className="text-lg font-bold text-slate-800">
                {tasks.filter(t => t.status === 'In Progress').length}
              </div>
              <div className="text-xs text-slate-600">In Progress</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/50">
              <div className="text-lg font-bold text-slate-800">
                {tasks.filter(t => t.priority === 'High').length}
              </div>
              <div className="text-xs text-slate-600">High Priority</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/50">
              <div className="text-lg font-bold text-slate-800">
                {tasks.filter(t => new Date(t.dueDate) < new Date()).length}
              </div>
              <div className="text-xs text-slate-600">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};