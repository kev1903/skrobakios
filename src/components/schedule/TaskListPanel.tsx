import React, { useState } from 'react';
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { Plus, Trash2, Edit3, Info, Filter, ArrowUpDown, Lock, Snowflake, EyeOff, X, Settings, MoreHorizontal } from 'lucide-react';
import { Scissors, Copy, ClipboardPaste, History, MessageSquare, ExternalLink, Calculator, FileText, Link2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { ModernGanttTask } from './types';
import { formatDateDisplay } from './utils';

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

interface CellSelection {
  taskId: string;
  field: string;
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

  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<CellSelection | null>(null);

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

  const [cellContextMenu, setCellContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({
    visible: false,
    x: 0,
    y: 0
  });

  // Helper function to create cell identifier
  const getCellId = (taskId: string, field: string) => `${taskId}-${field}`;

  // Helper function to check if cell is selected
  const isCellSelected = (taskId: string, field: string) => 
    selectedCells.has(getCellId(taskId, field));

  // Handle cell selection
  const handleCellSelection = (taskId: string, field: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const cellId = getCellId(taskId, field);
    
    if (!event.shiftKey && !event.ctrlKey && !event.metaKey) {
      // Single selection - clear other selections
      setSelectedCells(new Set([cellId]));
    } else if (event.ctrlKey || event.metaKey) {
      // Multi-selection with Ctrl/Cmd
      setSelectedCells(prev => {
        const newSet = new Set(prev);
        if (newSet.has(cellId)) {
          newSet.delete(cellId);
        } else {
          newSet.add(cellId);
        }
        return newSet;
      });
    }
  };

  // Handle mouse down for drag selection
  const handleMouseDown = (taskId: string, field: string, event: React.MouseEvent) => {
    if (event.button !== 0) return; // Only left mouse button
    
    setIsSelecting(true);
    setSelectionStart({ taskId, field });
    
    const cellId = getCellId(taskId, field);
    if (!event.ctrlKey && !event.metaKey) {
      setSelectedCells(new Set([cellId]));
    }
  };

  // Handle mouse enter for drag selection
  const handleMouseEnter = (taskId: string, field: string) => {
    if (!isSelecting || !selectionStart) return;

    const startTaskIndex = tasks.findIndex(t => t.id === selectionStart.taskId);
    const endTaskIndex = tasks.findIndex(t => t.id === taskId);
    
    const fields = ['title', 'duration', 'startDate', 'endDate', 'dependencies'];
    const startFieldIndex = fields.indexOf(selectionStart.field);
    const endFieldIndex = fields.indexOf(field);

    const minTaskIndex = Math.min(startTaskIndex, endTaskIndex);
    const maxTaskIndex = Math.max(startTaskIndex, endTaskIndex);
    const minFieldIndex = Math.min(startFieldIndex, endFieldIndex);
    const maxFieldIndex = Math.max(startFieldIndex, endFieldIndex);

    const newSelection = new Set<string>();
    
    for (let taskIndex = minTaskIndex; taskIndex <= maxTaskIndex; taskIndex++) {
      for (let fieldIndex = minFieldIndex; fieldIndex <= maxFieldIndex; fieldIndex++) {
        const task = tasks[taskIndex];
        const fieldName = fields[fieldIndex];
        if (task && fieldName) {
          newSelection.add(getCellId(task.id, fieldName));
        }
      }
    }
    
    setSelectedCells(newSelection);
  };

  // Handle mouse up to end selection
  const handleMouseUp = () => {
    setIsSelecting(false);
    setSelectionStart(null);
  };

  // Add global mouse up listener
  React.useEffect(() => {
    if (isSelecting) {
      document.addEventListener('mouseup', handleMouseUp);
      return () => document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isSelecting]);

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

  // Handle cell right-click context menu
  const handleCellContextMenu = (e: React.MouseEvent, taskId: string, field: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If the cell isn't selected, select it first
    if (!isCellSelected(taskId, field)) {
      const cellId = getCellId(taskId, field);
      setSelectedCells(new Set([cellId]));
    }
    
    setCellContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleCellContextMenuClose = () => {
    setCellContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleCellContextMenuAction = (action: string) => {
    console.log(`Cell action: ${action} on ${selectedCells.size} selected cells`);
    // Add your logic here for each cell action
    handleCellContextMenuClose();
  };

  // Close context menus on click outside
  React.useEffect(() => {
    const handleClick = () => {
      if (contextMenu.visible) {
        handleContextMenuClose();
      }
      if (cellContextMenu.visible) {
        handleCellContextMenuClose();
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [contextMenu.visible, cellContextMenu.visible]);

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
    const isSelected = isCellSelected(task.id, field);
    
    if (isEditing) {
      return (
        <div
          className={`relative ${isSelected ? 'bg-blue-100' : ''}`}
          onMouseDown={(e) => handleMouseDown(task.id, field, e)}
          onMouseEnter={() => handleMouseEnter(task.id, field)}
        >
          <input
            type={inputType}
            value={editingValue}
            onChange={(e) => onEditingValueChange(e.target.value)}
            onBlur={onSaveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveEdit();
              if (e.key === 'Escape') onCancelEdit();
            }}
            className={`border border-blue-300 rounded px-1 py-0.5 bg-white w-full ${className}`}
            autoFocus
          />
        </div>
      );
    }
    
    return (
      <div
        className={`relative cursor-pointer hover:bg-slate-200 px-1 py-0.5 rounded transition-colors ${
          isSelected ? 'bg-blue-100 border-2 border-blue-400' : ''
        } ${className}`}
        onClick={(e) => {
          if (!isSelecting) {
            handleCellSelection(task.id, field, e);
            onStartEditing(task.id, field, value);
          }
        }}
        onMouseDown={(e) => {
          if (e.detail > 1) return; // Prevent double-click issues
          handleMouseDown(task.id, field, e);
        }}
        onMouseEnter={() => handleMouseEnter(task.id, field)}
        onContextMenu={(e) => handleCellContextMenu(e, task.id, field)}
      >
        <span className="select-none">
          {field === 'duration' ? 
            `${value}d` : 
            field === 'dependencies' ? 
              (value || 'Click to add row numbers') : 
              (field === 'startDate' || field === 'endDate') ?
                formatDateDisplay(String(value)) :
                value
          }
        </span>
      </div>
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
      
      {/* Cell Context Menu */}
      {cellContextMenu.visible && (
        <div
          className="fixed bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 min-w-52"
          style={{
            left: `${cellContextMenu.x}px`,
            top: `${cellContextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between"
              onClick={() => handleCellContextMenuAction('cut')}
            >
              <div className="flex items-center gap-3">
                <Scissors className="w-4 h-4" />
                Cut
              </div>
              <span className="text-xs text-slate-400">Ctrl + X</span>
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between"
              onClick={() => handleCellContextMenuAction('copy')}
            >
              <div className="flex items-center gap-3">
                <Copy className="w-4 h-4" />
                Copy
              </div>
              <span className="text-xs text-slate-400">Ctrl + C</span>
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between"
              onClick={() => handleCellContextMenuAction('paste')}
            >
              <div className="flex items-center gap-3">
                <ClipboardPaste className="w-4 h-4" />
                Paste
              </div>
              <span className="text-xs text-slate-400">Ctrl + V</span>
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between"
              onClick={() => handleCellContextMenuAction('pasteSpecial')}
            >
              <div className="flex items-center gap-3">
                <ClipboardPaste className="w-4 h-4" />
                Paste Special...
              </div>
              <span className="text-xs text-slate-400">Ctrl + Shift + V</span>
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
              onClick={() => handleCellContextMenuAction('clearContents')}
            >
              <X className="w-4 h-4" />
              Clear Contents
            </button>
          </div>
          
          <div className="border-t border-slate-100 py-1">
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
              onClick={() => handleCellContextMenuAction('viewHistory')}
            >
              <History className="w-4 h-4" />
              View Cell History...
            </button>
          </div>
          
          <div className="border-t border-slate-100 py-1">
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
              onClick={() => handleCellContextMenuAction('insertRow')}
            >
              <Plus className="w-4 h-4" />
              Insert Row
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
              onClick={() => handleCellContextMenuAction('insertKey')}
            >
              <Plus className="w-4 h-4" />
              Insert Key
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
              onClick={() => handleCellContextMenuAction('deleteRow')}
            >
              <Trash2 className="w-4 h-4" />
              Delete Row
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
              onClick={() => handleCellContextMenuAction('addComment')}
            >
              <MessageSquare className="w-4 h-4" />
              Add a Row Comment
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
              onClick={() => handleCellContextMenuAction('rowActions')}
            >
              <Settings className="w-4 h-4" />
              Row Actions...
            </button>
          </div>
          
          <div className="border-t border-slate-100 py-1">
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
              onClick={() => handleCellContextMenuAction('generateFormula')}
            >
              <Calculator className="w-4 h-4" />
              Generate formula
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
              onClick={() => handleCellContextMenuAction('generateContent')}
            >
              <FileText className="w-4 h-4" />
              Generate content
            </button>
          </div>
          
          <div className="border-t border-slate-100 py-1">
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
              onClick={() => handleCellContextMenuAction('linkFromCell')}
            >
              <ExternalLink className="w-4 h-4" />
              Link from Cell in Other Sheet...
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
              onClick={() => handleCellContextMenuAction('manageReferences')}
            >
              <Link2 className="w-4 h-4" />
              Manage References...
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between"
              onClick={() => handleCellContextMenuAction('hyperlink')}
            >
              <div className="flex items-center gap-3">
                <Link2 className="w-4 h-4" />
                Hyperlink...
              </div>
              <span className="text-xs text-slate-400">Ctrl + K</span>
            </button>
          </div>
          
          <div className="border-t border-slate-100 py-1">
            <button
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
              onClick={() => handleCellContextMenuAction('convertToFormula')}
            >
              <Calculator className="w-4 h-4" />
              Convert to Column Formula
            </button>
          </div>
        </div>
      )}
    </div>
  );
};