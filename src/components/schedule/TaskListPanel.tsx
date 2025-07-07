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
        {field === 'duration' ? 
          `${value}d` : 
          field === 'dependencies' ? 
            (value || 'Click to add row numbers') : 
            value
        }
      </span>
    );
  };

  return (
    <div className="w-[700px] bg-white border-r border-slate-200 flex flex-col">
      {/* Column Headers */}
      <div className="h-12 bg-slate-50 border-b border-slate-200 flex items-center px-4">
        <div className="w-12 text-sm font-medium text-slate-700 text-center flex-shrink-0">#</div>
        <div className="w-48 text-sm font-medium text-slate-700 flex-shrink-0 px-2">Title</div>
        <div className="w-20 text-sm font-medium text-slate-700 text-center flex-shrink-0">Duration</div>
        <div className="w-24 text-sm font-medium text-slate-700 text-center flex-shrink-0">Start Date</div>
        <div className="w-24 text-sm font-medium text-slate-700 text-center flex-shrink-0">End Date</div>
        <div className="w-20 text-sm font-medium text-slate-700 text-center flex-shrink-0">Status</div>
        <div className="w-32 text-sm font-medium text-slate-700 text-center flex-shrink-0">Dependencies</div>
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

                         {/* Row Number */}
                         <div className="w-12 text-center flex-shrink-0">
                           <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                             {task.rowNumber}
                           </span>
                         </div>

                         {/* Title */}
                         <div className="w-48 flex items-center flex-shrink-0 px-2 min-w-0">
                           <div style={{ marginLeft: `${task.level * 16}px` }} className="flex items-center min-w-0 w-full">
                             {task.children && task.children.length > 0 && (
                               <button
                                 onClick={() => onToggleExpanded(task.id)}
                                 className="mr-2 p-1 hover:bg-slate-200 rounded transition-colors flex-shrink-0"
                               >
                                 {expandedTasks.has(task.id) ? (
                                   <ChevronDown className="w-3 h-3 text-slate-600" />
                                 ) : (
                                   <ChevronRight className="w-3 h-3 text-slate-600" />
                                 )}
                               </button>
                             )}
                             
                             <div className="min-w-0">
                               {renderEditableCell(
                                 task,
                                 'title',
                                 task.title,
                                 'text',
                                 `text-sm truncate ${task.level === 0 ? 'font-medium text-slate-900' : 'text-slate-700'}`
                               )}
                             </div>
                           </div>
                         </div>
                         
                         {/* Duration */}
                         <div className="w-20 text-center flex-shrink-0">
                           {renderEditableCell(
                             task,
                             'duration',
                             task.duration,
                             'number',
                             'w-full text-sm text-slate-600 text-center'
                           )}
                         </div>
                         
                         {/* Start Date */}
                         <div className="w-24 text-center flex-shrink-0">
                           {renderEditableCell(
                             task,
                             'startDate',
                             task.startDate,
                             'date',
                             'w-full text-xs text-slate-600 text-center'
                           )}
                         </div>
                         
                         {/* End Date */}
                         <div className="w-24 text-center flex-shrink-0">
                           {renderEditableCell(
                             task,
                             'endDate',
                             task.endDate,
                             'date',
                             'w-full text-xs text-slate-600 text-center'
                           )}
                         </div>
                         
                         {/* Status */}
                         <div className="w-20 text-center flex-shrink-0">
                           {renderEditableCell(
                             task,
                             'status',
                             task.status,
                             'number',
                             `w-full text-sm font-medium text-center ${getStatusColor(task.status)}`
                           )}
                         </div>
                         
                         {/* Dependencies */}
                         <div className="w-32 text-center flex-shrink-0 px-2 min-w-0">
                           {renderEditableCell(
                             task,
                             'dependencies',
                             task.dependencies && task.dependencies.length > 0 ? task.dependencies.join(', ') : '',
                             'text',
                             'w-full text-xs text-slate-500 text-center truncate'
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