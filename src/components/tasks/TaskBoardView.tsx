
import React, { useState } from 'react';
import { useTaskContext } from './TaskContext';
import { TaskBoardColumn } from './TaskBoardColumn';

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
        <TaskBoardColumn
          key={column.id}
          column={column}
          tasks={getTasksByStatus(column.id)}
          editingTaskId={editingTaskId}
          newTaskTitle={newTaskTitle}
          onTaskTitleChange={setNewTaskTitle}
          onSaveTask={handleSaveTask}
          onCancelEdit={handleCancelEdit}
          onKeyPress={handleKeyPress}
          onBlur={handleBlur}
          onAddTask={handleAddTask}
        />
      ))}
    </div>
  );
};
