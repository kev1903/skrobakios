import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody } from '@/components/ui/table';
import { useTaskContext, Task } from './TaskContext';
import { TaskEditSidePanel } from './TaskEditSidePanel';
import { AddTaskDialog } from './AddTaskDialog';
import { TaskMobileCard } from './TaskMobileCard';
import { TaskTableRow } from './TaskTableRow';
import { TaskTableHeader } from './TaskTableHeader';
import { TaskListControls } from './TaskListControls';
import { useIsMobile } from '@/hooks/use-mobile';

interface TaskListViewProps {
  projectId?: string;
}

export const TaskListView = ({ projectId }: TaskListViewProps) => {
  const { tasks, deleteTask } = useTaskContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsSidePanelOpen(true);
  };

  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false);
    setSelectedTask(null);
  };

  const handleAddTask = () => {
    setIsAddTaskDialogOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

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
        return "bg-green-100 text-green-800 border-green-200";
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "not started":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardContent className="p-0">
          {isMobile ? (
            <div className="space-y-3 p-4">
              <TaskListControls onAddTask={handleAddTask} isMobile />
              
              {tasks.map((task, index) => (
                <TaskMobileCard
                  key={index}
                  task={task}
                  onTaskClick={handleTaskClick}
                  onDeleteTask={handleDeleteTask}
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TaskTableHeader />
                <TableBody>
                  <TaskListControls onAddTask={handleAddTask} />
                  
                  {tasks.map((task, index) => (
                    <TaskTableRow
                      key={index}
                      task={task}
                      onTaskClick={handleTaskClick}
                      onDeleteTask={handleDeleteTask}
                      getPriorityColor={getPriorityColor}
                      getStatusColor={getStatusColor}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <TaskEditSidePanel
        task={selectedTask}
        isOpen={isSidePanelOpen}
        onClose={handleCloseSidePanel}
        projectId={projectId}
      />

      <AddTaskDialog
        isOpen={isAddTaskDialogOpen}
        onClose={() => setIsAddTaskDialogOpen(false)}
        status="Not Started"
      />
    </div>
  );
};
