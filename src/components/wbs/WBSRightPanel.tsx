import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, NotebookPen, ListTodo, Unlink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WBSItem {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
  assignedTo?: string;
  level: number;
  hasChildren?: boolean;
  is_task_enabled?: boolean;
  linked_task_id?: string;
}

interface WBSRightPanelProps {
  items: WBSItem[];
  onItemUpdate: (itemId: string, updates: any) => void;
  onContextMenuAction: (action: string, itemId: string, type: string) => void;
  onOpenNotesDialog: (item: any) => void;
  EditableCell: any;
  StatusSelect: any;
  ProgressInput: any;
  ProgressDisplay: any;
  getProgressColor: (progress: number) => string;
  scrollRef?: React.RefObject<HTMLDivElement>;
  onScroll?: () => void;
  hoveredId?: string | null;
  onRowHover?: (id: string | null) => void;
  selectedItems?: string[];
  onRowClick?: (itemId: string, ctrlKey?: boolean) => void;
}

export const WBSRightPanel = ({
  items,
  onItemUpdate,
  onContextMenuAction,
  onOpenNotesDialog,
  EditableCell,
  StatusSelect,
  ProgressInput,
  ProgressDisplay,
  getProgressColor,
  scrollRef,
  onScroll,
  hoveredId,
  onRowHover,
  selectedItems = [],
  onRowClick
}: WBSRightPanelProps) => {
  // Determine if we're in unified scroll mode
  const useUnifiedScroll = !scrollRef || !onScroll;

  const content = (
    <>
      {items.map((item) => (
         <div
           key={item.id}
            className={`grid items-center w-full border-b border-gray-100 cursor-pointer transition-all duration-200 ${
              selectedItems.includes(item.id) 
                ? 'bg-primary/10 border-l-4 border-l-primary shadow-sm' 
                : hoveredId === item.id 
                  ? 'bg-gradient-to-r from-gray-200/80 via-gray-100/60 to-gray-200/80 shadow-lg ring-2 ring-gray-300/50' 
                  : 'bg-white hover:bg-slate-50/50'
            }`}
            style={{
              gridTemplateColumns: '140px 120px 160px 40px 84px',
              height: '1.75rem',
          }}
          onMouseEnter={() => onRowHover?.(item.id)}
          onMouseLeave={() => onRowHover?.(null)}
          onClick={(e) => onRowClick?.(item.id, e.ctrlKey || e.metaKey)}
        >

            <div className="px-2 flex items-center justify-start h-full">
              <StatusSelect 
                value={item.status} 
                onChange={(newStatus: string) => onItemUpdate(item.id, { status: newStatus })}
                disabled={item.hasChildren}
              />
            </div>

            <div className="px-2 flex items-center justify-start h-full">
              <div className="flex items-center gap-1">
                <div className="w-8 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${getProgressColor(item.progress)}`} 
                    style={{ width: `${item.progress}%` }} 
                  />
                </div>
                <ProgressInput 
                  value={item.progress} 
                  onChange={(newProgress: number) => onItemUpdate(item.id, { progress: newProgress })}
                  disabled={item.hasChildren}
                />
              </div>
            </div>

            <div className="px-2 flex items-center justify-start h-full text-muted-foreground text-xs">
              <div className="flex items-center gap-1 w-full">
                {item.is_task_enabled && (
                  <ListTodo className="w-3 h-3 text-blue-600 flex-shrink-0" />
                )}
                <EditableCell
                  id={item.id}
                  type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : item.level === 2 ? 'element' : 'task'}
                  field="assignedTo"
                  value={item.assignedTo || ''}
                  placeholder="Assign to..."
                  className="text-xs text-muted-foreground flex-1"
                />
              </div>
           </div>

           <div className="px-1 flex items-center justify-center h-full">
             <Button
               variant="ghost"
               size="sm"
               className="h-6 w-6 p-0 hover:bg-muted"
               onClick={() => onOpenNotesDialog(item)}
               title={item.description ? "View/Edit note" : "Add note"}
             >
               <NotebookPen className={`w-4 h-4 transition-colors ${
                 item.description && item.description.trim() 
                   ? 'text-blue-600 hover:text-blue-700' 
                   : 'text-muted-foreground hover:text-foreground'
               }`} />
             </Button>
           </div>

           <div className="px-2 flex items-center justify-center h-full">
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                   <MoreHorizontal className="w-3 h-3" />
                 </Button>
               </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {!item.is_task_enabled ? (
                    <DropdownMenuItem 
                      onClick={() => onContextMenuAction('convert_to_task', item.id, item.level === 0 ? 'phase' : item.level === 1 ? 'component' : item.level === 2 ? 'element' : 'task')}
                    >
                      <ListTodo className="w-3 h-3 mr-2" />
                      Convert to Task
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem 
                        onClick={() => onContextMenuAction('view_task', item.id, item.level === 0 ? 'phase' : item.level === 1 ? 'component' : item.level === 2 ? 'element' : 'task')}
                      >
                        <ListTodo className="w-3 h-3 mr-2" />
                        View Task Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onContextMenuAction('unlink_task', item.id, item.level === 0 ? 'phase' : item.level === 1 ? 'component' : item.level === 2 ? 'element' : 'task')}
                      >
                        <Unlink className="w-3 h-3 mr-2" />
                        Remove Task Link
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={() => onContextMenuAction('delete', item.id, item.level === 0 ? 'phase' : item.level === 1 ? 'component' : item.level === 2 ? 'element' : 'task')} className="text-destructive focus:text-destructive">
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
           </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="bg-white">
      {useUnifiedScroll ? (
        // Unified scroll mode - parent handles scrolling
        <div>
          {content}
        </div>
      ) : (
        // Separate scroll mode - this component handles its own scrolling
        <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin" onScroll={onScroll}>
          {content}
        </div>
      )}
    </div>
  );
};