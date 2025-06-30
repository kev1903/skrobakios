import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Check, X } from 'lucide-react';
import { useTaskContext } from './TaskContext';

export const TaskBoardView = () => {
  const { tasks, addTask, setTasks } = useTaskContext();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const statusColumns = [
    { id: 'Not Started', title: 'Not Started', color: 'bg-gray-50' },
    { id: 'Pending', title: 'Pending', color: 'bg-yellow-50' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-blue-50' },
    { id: 'Completed', title: 'Completed', color: 'bg-green-50' }
  ];

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

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleAddTask = (status: string) => {
    const tempTaskId = `temp-${Date.now()}`;
    console.log(`Adding new task to ${status} column`);
    
    // Create a temporary task for inline editing
    const tempTask = {
      id: tempTaskId,
      taskName: '',
      priority: 'Medium' as const,
      assignedTo: { name: 'Unassigned', avatar: '' },
      dueDate: new Date().toISOString().split('T')[0],
      status: status as 'Completed' | 'In Progress' | 'Pending' | 'Not Started',
      progress: 0,
      description: '',
      category: 'General'
    };

    addTask(tempTask);
    setEditingTaskId(tempTaskId);
    setNewTaskTitle('');
  };

  const handleSaveTask = (taskId: string, status: string) => {
    if (!newTaskTitle.trim()) {
      handleCancelEdit(taskId);
      return;
    }

    const finalTask = {
      id: `#PT${String(Date.now()).slice(-3)}`,
      taskName: newTaskTitle.trim(),
      priority: 'Medium' as const,
      assignedTo: { name: 'Unassigned', avatar: '' },
      dueDate: new Date().toISOString().split('T')[0],
      status: status as 'Completed' | 'In Progress' | 'Pending' | 'Not Started',
      progress: 0,
      description: '',
      category: 'General'
    };

    // Remove temporary task and add final task
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks([...updatedTasks, finalTask]);

    console.log(`Added new task: ${newTaskTitle} to ${status} column`);
    setEditingTaskId(null);
    setNewTaskTitle('');
  };

  const handleCancelEdit = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    
    setEditingTaskId(null);
    setNewTaskTitle('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, taskId: string, status: string) => {
    if (e.key === 'Enter') {
      handleSaveTask(taskId, status);
    } else if (e.key === 'Escape') {
      handleCancelEdit(taskId);
    }
  };

  const handleBlur = (taskId: string, status: string) => {
    // Only save if the task name is not empty, otherwise cancel the edit
    if (newTaskTitle.trim()) {
      handleSaveTask(taskId, status);
    } else {
      handleCancelEdit(taskId);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {statusColumns.map((column) => (
        <div key={column.id} className={`${column.color} rounded-lg p-4`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{column.title}</h3>
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
              {getTasksByStatus(column.id).length}
            </span>
          </div>
          
          <div className="space-y-3">
            {getTasksByStatus(column.id).map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  {editingTaskId === task.id ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Input
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="Enter task title..."
                          className="text-sm"
                          autoFocus
                          onKeyDown={(e) => handleKeyPress(e, task.id, column.id)}
                          onBlur={() => handleBlur(task.id, column.id)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSaveTask(task.id, column.id)}
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCancelEdit(task.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm">{task.taskName}</h4>
                        <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-xs`}>
                          {task.priority}
                        </Badge>
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-gray-600">{task.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={task.assignedTo.avatar} />
                            <AvatarFallback className="text-xs">
                              {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-600">{task.assignedTo.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{task.dueDate}</span>
                      </div>
                      
                      {task.progress > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {/* Add Task Button */}
            <Button
              variant="ghost"
              onClick={() => handleAddTask(column.id)}
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-white/50 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add task
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
