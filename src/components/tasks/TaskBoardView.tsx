import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useTaskContext } from './TaskContext';
import { TaskBoardColumn } from './TaskBoardColumn';
import { TaskEditSidePanel } from './TaskEditSidePanel';
import { Task } from './TaskContext';

export const TaskBoardView = ({ projectId }: { projectId?: string }) => {
  const { tasks, addTask, updateTask } = useTaskContext();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  const statusColumns = [
    { id: 'Not Started', title: 'Not Started', color: 'bg-gray-50' },
    { id: 'Pending', title: 'Pending', color: 'bg-yellow-50' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-blue-50' },
    { id: 'Completed', title: 'Completed', color: 'bg-green-50' }
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleTaskClick = (task: Task) => {
    console.log('Board task clicked:', task);
    // Don't open side panel for temporary tasks being edited
    if (task.id.startsWith('temp-')) {
      return;
    }
    
    setSelectedTask(task);
    setIsSidePanelOpen(true);
    console.log('Board side panel should open now');
  };

  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false);
    setSelectedTask(null);
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If there's no destination or the item was dropped in the same place, do nothing
    if (!destination || (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )) {
      return;
    }

    // Find the task being dragged
    const draggedTask = tasks.find(task => task.id === draggableId);
    if (!draggedTask) return;

    // Update the task's status to match the destination column
    const newStatus = destination.droppableId as Task['status'];
    updateTask(draggedTask.id, { status: newStatus });

    console.log(`Moved task "${draggedTask.taskName}" from ${source.droppableId} to ${newStatus}`);
  };

  const handleAddTask = (status: string) => {
    const tempTaskId = `temp-${Date.now()}`;
    console.log(`Adding new task to ${status} column`);
    
    // Don't create temporary tasks - we'll handle this differently
    console.log("Add task clicked for status:", status);
    setEditingTaskId(tempTaskId);
    setNewTaskTitle('');
  };

  const handleSaveTask = (taskId: string, status: string) => {
    if (!newTaskTitle.trim()) {
      handleCancelEdit(taskId);
      return;
    }

    if (!projectId) return;
    
    const finalTask = {
      project_id: projectId,
      taskName: newTaskTitle.trim(),
      taskType: 'Task' as const,
      priority: 'Medium' as const,
      assignedTo: { name: 'Unassigned', avatar: '' },
      dueDate: new Date().toISOString().split('T')[0],
      status: status as 'Completed' | 'In Progress' | 'Pending' | 'Not Started',
      progress: 0,
      description: ''
    };

    addTask(finalTask);

    console.log(`Added new task: ${newTaskTitle} to ${status} column`);
    setEditingTaskId(null);
    setNewTaskTitle('');
  };

  const handleCancelEdit = (taskId: string) => {
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
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col md:flex-row gap-6 md:h-full">
          {statusColumns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 md:w-64 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 transition-colors ${
                    snapshot.isDraggingOver ? 'bg-white/20 border-white/40' : ''
                  }`}
                >
                  <TaskBoardColumn
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
                    onTaskClick={handleTaskClick}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <TaskEditSidePanel
        task={selectedTask}
        isOpen={isSidePanelOpen}
        onClose={handleCloseSidePanel}
      />
    </>
  );
};
