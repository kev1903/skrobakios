
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Task } from './TaskContext';
import { TaskCard } from './TaskCard';
import { TaskCardEditor } from './TaskCardEditor';
import { AddTaskButton } from './AddTaskButton';

interface TaskBoardColumnProps {
  column: {
    id: string;
    title: string;
    color: string;
  };
  tasks: Task[];
  editingTaskId: string | null;
  newTaskTitle: string;
  onTaskTitleChange: (title: string) => void;
  onSaveTask: (taskId: string, status: string) => void;
  onCancelEdit: (taskId: string) => void;
  onKeyPress: (e: React.KeyboardEvent, taskId: string, status: string) => void;
  onBlur: (taskId: string, status: string) => void;
  onAddTask: (status: string) => void;
  onTaskClick: (task: Task) => void;
}

export const TaskBoardColumn = ({
  column,
  tasks,
  editingTaskId,
  newTaskTitle,
  onTaskTitleChange,
  onSaveTask,
  onCancelEdit,
  onKeyPress,
  onBlur,
  onAddTask,
  onTaskClick
}: TaskBoardColumnProps) => {
  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{column.title}</h3>
        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
          {tasks.length}
        </span>
      </div>
      
      <div className="space-y-3 min-h-[200px]">
        {tasks.map((task, index) => (
          <div key={task.id}>
            {editingTaskId === task.id ? (
              <TaskCardEditor
                taskTitle={newTaskTitle}
                onTaskTitleChange={onTaskTitleChange}
                onSave={() => onSaveTask(task.id, column.id)}
                onCancel={() => onCancelEdit(task.id)}
                onKeyPress={(e) => onKeyPress(e, task.id, column.id)}
                onBlur={() => onBlur(task.id, column.id)}
              />
            ) : (
              <Draggable 
                draggableId={task.id} 
                index={index}
                isDragDisabled={task.id.startsWith('temp-')}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`transition-transform ${
                      snapshot.isDragging ? 'rotate-3 scale-105 shadow-lg' : ''
                    }`}
                  >
                    <TaskCard 
                      task={task} 
                      onClick={onTaskClick}
                    />
                  </div>
                )}
              </Draggable>
            )}
          </div>
        ))}
        
        <AddTaskButton onAddTask={() => onAddTask(column.id)} />
      </div>
    </div>
  );
};
