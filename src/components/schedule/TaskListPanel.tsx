import React from 'react';
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { ModernGanttTask } from './types';

interface TaskListPanelProps {
  tasks: ModernGanttTask[];
  expandedTasks: Set<string>;
  editingField: {taskId: string, field: string} | null;
  editingValue: string;
  onToggleExpanded: (taskId: string) => void;
  onStartEditing: (taskId: string, field: string, currentValue: string | number) => void;
  onEditingValueChange: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDragEnd: (result: DropResult) => void;
}

export const TaskListPanel = ({
  tasks,
  expandedTasks,
  editingField,
  editingValue,
  onToggleExpanded,
  onStartEditing,
  onEditingValueChange,
  onSaveEdit,
  onCancelEdit,
  onDragEnd
}: TaskListPanelProps) => {
  const getStatusColor = (status: number): string => {
    if (status === 100) return 'text-emerald-600';
    if (status > 50) return 'text-blue-600';
    if (status > 0) return 'text-amber-600';
    return 'text-slate-500';
  };

  const renderEditableCell = (
    task: ModernGanttTask,
    field: string,
    value: string | number,
    inputType: string = 'text',
    className: string = ''
  ) => {
    const isEditing = editingField?.taskId === task.id && editingField?.field === field;
    
    if (isEditing) {
      return (
        <input
          type={inputType}
          value={editingValue}
          onChange={(e) => onEditingValueChange(e.target.value)}
          onBlur={onSaveEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSaveEdit();
            if (e.key === 'Escape') onCancelEdit();
          }}
          className={`border border-blue-300 rounded px-1 py-0.5 bg-white ${className}`}
          autoFocus
        />
      );
    }
    
    return (
      <span 
        className={`cursor-pointer hover:bg-slate-200 px-1 py-0.5 rounded ${className}`}
        onClick={() => onStartEditing(task.id, field, value)}
      >
        {field === 'duration' ? `${value}d` : value}
      </span>
    );
  };

  return (
    <div className="w-[600px] bg-white border-r border-slate-200 flex flex-col">
      {/* Column Headers */}
      <div className="h-12 bg-slate-50 border-b border-slate-200 flex items-center px-4">
        <div className="w-48 text-sm font-medium text-slate-700">Title</div>
        <div className="w-20 text-sm font-medium text-slate-700 text-center">Duration</div>
        <div className="w-24 text-sm font-medium text-slate-700 text-center">Start Date</div>
        <div className="w-24 text-sm font-medium text-slate-700 text-center">End Date</div>
        <div className="w-20 text-sm font-medium text-slate-700 text-center">Status</div>
        <div className="flex-1 text-sm font-medium text-slate-700 text-center">Dependencies</div>
      </div>

      {/* Task Rows */}
      <div className="flex-1 overflow-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="task-list">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`h-12 border-b border-slate-100 flex items-center px-4 hover:bg-slate-50 group ${
                          snapshot.isDragging ? 'bg-blue-50 shadow-lg' : ''
                        }`}
                      >
                        {/* Drag Handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="mr-2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="w-4 h-4 text-slate-400" />
                        </div>

                        {/* Title */}
                        <div className="w-48 flex items-center">
                          <div style={{ marginLeft: `${task.level * 16}px` }} className="flex items-center">
                            {task.children && task.children.length > 0 && (
                              <button
                                onClick={() => onToggleExpanded(task.id)}
                                className="mr-2 p-1 hover:bg-slate-200 rounded transition-colors"
                              >
                                {expandedTasks.has(task.id) ? (
                                  <ChevronDown className="w-3 h-3 text-slate-600" />
                                ) : (
                                  <ChevronRight className="w-3 h-3 text-slate-600" />
                                )}
                              </button>
                            )}
                            
                            {renderEditableCell(
                              task,
                              'title',
                              task.title,
                              'text',
                              `text-sm ${task.level === 0 ? 'font-medium text-slate-900' : 'text-slate-700'}`
                            )}
                          </div>
                        </div>
                        
                        {/* Duration */}
                        <div className="w-20 text-center">
                          {renderEditableCell(
                            task,
                            'duration',
                            task.duration,
                            'number',
                            'w-16 text-sm text-slate-600 text-center'
                          )}
                        </div>
                        
                        {/* Start Date */}
                        <div className="w-24 text-center">
                          {renderEditableCell(
                            task,
                            'startDate',
                            task.startDate,
                            'date',
                            'w-20 text-xs text-slate-600 text-center'
                          )}
                        </div>
                        
                        {/* End Date */}
                        <div className="w-24 text-center">
                          {renderEditableCell(
                            task,
                            'endDate',
                            task.endDate,
                            'date',
                            'w-20 text-xs text-slate-600 text-center'
                          )}
                        </div>
                        
                        {/* Status */}
                        <div className="w-20 text-center">
                          {renderEditableCell(
                            task,
                            'status',
                            task.status,
                            'number',
                            `w-12 text-sm font-medium text-center ${getStatusColor(task.status)}`
                          )}
                        </div>
                        
                        {/* Dependencies */}
                        <div className="flex-1 text-center">
                          {renderEditableCell(
                            task,
                            'dependencies',
                            task.dependencies.join(', '),
                            'text',
                            'text-xs text-slate-500 text-center'
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};