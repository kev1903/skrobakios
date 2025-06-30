
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock } from 'lucide-react';
import { useTaskContext } from './TaskContext';

export const TaskTimelineView = () => {
  const { tasks } = useTaskContext();

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500";
      case "in progress":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      case "not started":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Task Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-6">
              {sortedTasks.map((task, index) => (
                <div key={task.id} className="relative flex items-start space-x-4">
                  {/* Timeline dot */}
                  <div className={`relative z-10 w-4 h-4 rounded-full ${getStatusColor(task.status)} border-4 border-white shadow`}></div>
                  
                  {/* Task card */}
                  <div className="flex-1 min-w-0">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{task.taskName}</h4>
                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={task.assignedTo.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-gray-600">{task.assignedTo.name}</span>
                              </div>
                              
                              <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>Due: {task.dueDate}</span>
                              </div>
                            </div>
                            
                            {task.progress > 0 && (
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${task.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600">{task.progress}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
