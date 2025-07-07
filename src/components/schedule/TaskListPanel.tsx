import React, { useState } from 'react';
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { Plus, Trash2, Edit3, Info, Filter, ArrowUpDown, Lock, Snowflake, EyeOff, X, Settings, MoreHorizontal } from 'lucide-react';
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
  width?: number;
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
  onDragEnd,
  width = 600
}: TaskListPanelProps) => {
  const [columnWidths, setColumnWidths] = useState({
    rowNumber: 60,
    title: 200,
    duration: 80,
    startDate: 100,
    endDate: 100,
    dependencies: 160
  });

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    column: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    column: ''
  });

  const handleContextMenu = (e: React.MouseEvent, column: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      column
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleContextMenuAction = (action: string) => {
    console.log(`Action: ${action} on column: ${contextMenu.column}`);
    // Add your logic here for each action
    handleContextMenuClose();
  };

  // Close context menu on click outside
  React.useEffect(() => {
    const handleClick = () => {
      if (contextMenu.visible) {
        handleContextMenuClose();
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [contextMenu.visible]);

  const handleColumnResize = (column: string, newWidth: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [column]: Math.max(50, newWidth) // Minimum width of 50px
    }));
  };

  const ResizeHandle = ({ column }: { column: string }) => (
    <div
      className="absolute right-0 top-0 w-1 h-full cursor-col-resize bg-slate-300 opacity-0 hover:opacity-100 hover:bg-blue-400 transition-opacity"
      onMouseDown={(e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = columnWidths[column as keyof typeof columnWidths];
        
        const handleMouseMove = (e: MouseEvent) => {
          const diff = e.clientX - startX;
          handleColumnResize(column, startWidth + diff);
        };
        
        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }}
    />
  );

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
    <div 
      className="bg-white border-r border-slate-200 flex flex-col"
      style={{ width: `${width}px` }}
    >
      {/* Task Rows with Headers that Scroll Together */}
      <div className="flex-1 overflow-auto"
           onScroll={(e) => {
             // Sync scroll with timeline if needed
             const scrollLeft = e.currentTarget.scrollLeft;
             // This could be connected to timeline scroll sync
           }}
      >
        {/* Column Headers */}
        <div className="h-12 bg-slate-50 border-b border-slate-200 flex items-center sticky top-0 z-10">
          {/* Drag Handle Space - matches row structure */}
          <div className="w-8 flex-shrink-0"></div>
          
          <div 
            className="text-sm font-medium text-slate-700 text-center flex-shrink-0 relative border-r border-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-100"
            style={{ width: `${columnWidths.rowNumber}px` }}
            onContextMenu={(e) => handleContextMenu(e, 'rowNumber')}
          >
            #
            <ResizeHandle column="rowNumber" />
          </div>
          <div 
            className="text-sm font-medium text-slate-700 flex-shrink-0 px-2 relative border-r border-slate-100 flex items-center cursor-pointer hover:bg-slate-100"
            style={{ width: `${columnWidths.title}px` }}
            onContextMenu={(e) => handleContextMenu(e, 'title')}
          >
            Title
            <ResizeHandle column="title" />
          </div>
          <div 
            className="text-sm font-medium text-slate-700 text-center flex-shrink-0 relative border-r border-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-100"
            style={{ width: `${columnWidths.duration}px` }}
            onContextMenu={(e) => handleContextMenu(e, 'duration')}
          >
            Duration
            <ResizeHandle column="duration" />
          </div>
          <div 
            className="text-sm font-medium text-slate-700 text-center flex-shrink-0 relative border-r border-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-100"
            style={{ width: `${columnWidths.startDate}px` }}
            onContextMenu={(e) => handleContextMenu(e, 'startDate')}
          >
            Start Date
            <ResizeHandle column="startDate" />
          </div>
          <div 
            className="text-sm font-medium text-slate-700 text-center flex-shrink-0 relative border-r border-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-100"
            style={{ width: `${columnWidths.endDate}px` }}
            onContextMenu={(e) => handleContextMenu(e, 'endDate')}
          >
            End Date
            <ResizeHandle column="endDate" />
          </div>
          <div 
            className="text-sm font-medium text-slate-700 text-center flex-shrink-0 relative flex items-center justify-center cursor-pointer hover:bg-slate-100"
            style={{ width: `${columnWidths.dependencies}px` }}
            onContextMenu={(e) => handleContextMenu(e, 'dependencies')}
          >
            Dependencies
            <ResizeHandle column="dependencies" />
          </div>
        </div>
        {/* Task List */}
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
                        className={`h-12 border-b border-slate-100 flex items-center hover:bg-slate-50 group ${
                          snapshot.isDragging ? 'bg-blue-50 shadow-lg' : ''
                        }`}
                      >
                        {/* Drag Handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="w-8 flex-shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="w-4 h-4 text-slate-400" />
                        </div>

                         {/* Row Number */}
                         <div 
                           className="text-center flex-shrink-0 border-r border-slate-100"
                           style={{ width: `${columnWidths.rowNumber}px` }}
                         >
                           <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                             {index + 1}
                           </span>
                         </div>

                         {/* Title */}
                         <div 
                           className="flex items-center flex-shrink-0 px-2 min-w-0 border-r border-slate-100"
                           style={{ width: `${columnWidths.title}px` }}
                         >
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
                         <div 
                           className="text-center flex-shrink-0 border-r border-slate-100"
                           style={{ width: `${columnWidths.duration}px` }}
                         >
                           {renderEditableCell(
                             task,
                             'duration',
                             task.duration,
                             'number',
                             'w-full text-sm text-slate-600 text-center'
                           )}
                         </div>
                         
                         {/* Start Date */}
                         <div 
                           className="text-center flex-shrink-0 border-r border-slate-100"
                           style={{ width: `${columnWidths.startDate}px` }}
                         >
                           {renderEditableCell(
                             task,
                             'startDate',
                             task.startDate,
                             'date',
                             'w-full text-xs text-slate-600 text-center'
                           )}
                         </div>
                         
                         {/* End Date */}
                         <div 
                           className="text-center flex-shrink-0 border-r border-slate-100"
                           style={{ width: `${columnWidths.endDate}px` }}
                         >
                           {renderEditableCell(
                             task,
                             'endDate',
                             task.endDate,
                             'date',
                             'w-full text-xs text-slate-600 text-center'
                           )}
                         </div>
                         
                         {/* Dependencies */}
                         <div 
                           className="text-center flex-shrink-0 px-2 min-w-0"
                           style={{ width: `${columnWidths.dependencies}px` }}
                         >
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
      
      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          className="fixed bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 min-w-48"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => handleContextMenuAction('insertLeft')}
            >
              <Plus className="w-4 h-4" />
              Insert Column Left
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => handleContextMenuAction('insertRight')}
            >
              <Plus className="w-4 h-4" />
              Insert Column Right
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => handleContextMenuAction('deleteColumn')}
            >
              <Trash2 className="w-4 h-4" />
              Delete Column
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => handleContextMenuAction('renameColumn')}
            >
              <Edit3 className="w-4 h-4" />
              Rename Column...
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => handleContextMenuAction('editDescription')}
            >
              <Info className="w-4 h-4" />
              Edit Column Description...
            </button>
          </div>
          
          <div className="border-t border-slate-100 py-1">
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => handleContextMenuAction('filter')}
            >
              <Filter className="w-4 h-4" />
              Filter...
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => handleContextMenuAction('sortRows')}
            >
              <ArrowUpDown className="w-4 h-4" />
              Sort Rows...
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => handleContextMenuAction('lockColumn')}
            >
              <Lock className="w-4 h-4" />
              Lock Column
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => handleContextMenuAction('freezeColumn')}
            >
              <Snowflake className="w-4 h-4" />
              Freeze Column
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => handleContextMenuAction('hideColumn')}
            >
              <EyeOff className="w-4 h-4" />
              Hide Column
            </button>
          </div>
          
          <div className="border-t border-slate-100 py-1">
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => handleContextMenuAction('closeGantt')}
            >
              <X className="w-4 h-4" />
              Close Gantt
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => handleContextMenuAction('editProjectSettings')}
            >
              <Settings className="w-4 h-4" />
              Edit Project Settings...
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => handleContextMenuAction('editColumnProperties')}
            >
              <MoreHorizontal className="w-4 h-4" />
              Edit Column Properties...
            </button>
          </div>
        </div>
      )}
    </div>
  );
};