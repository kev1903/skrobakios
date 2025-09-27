import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, NotebookPen } from 'lucide-react';
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
  scrollRef: React.RefObject<HTMLDivElement>;
  onScroll: () => void;
  hoveredId?: string | null;
  onRowHover?: (id: string | null) => void;
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
  onRowHover
}: WBSRightPanelProps) => {
  return (
    <div className="h-full bg-white overflow-hidden">
      {/* Content - No separate header since it's now unified */}
      <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden w-full" onScroll={onScroll}>
        {items.map((item) => (
           <div
             key={item.id}
              className={`grid items-center w-full border-b border-gray-100 ${
                item.level === 0 
                  ? 'bg-gradient-to-r from-slate-100 via-blue-50 to-slate-100 border-l-[6px] border-l-blue-800 shadow-sm hover:from-blue-50 hover:to-blue-100' 
                  : item.level === 1
                  ? 'bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 border-l-[4px] border-l-blue-400 hover:from-blue-100 hover:to-blue-200'
                  : 'bg-white border-l-2 border-l-slate-300 hover:bg-slate-50/50'
              } transition-all duration-200 ${hoveredId === item.id ? 'bg-gradient-to-r from-gray-200/80 via-gray-100/60 to-gray-200/80 shadow-lg ring-2 ring-gray-300/50' : ''}`}
              style={{
                gridTemplateColumns: '140px 120px 160px 40px 84px',
                height: '1.75rem',
              }}
             onMouseEnter={() => onRowHover?.(item.id)}
             onMouseLeave={() => onRowHover?.(null)}
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
               <EditableCell
                 id={item.id}
                 type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : item.level === 2 ? 'element' : 'task'}
                 field="assignedTo"
                 value={item.assignedTo || ''}
                 placeholder="Assign to..."
                 className="text-xs text-muted-foreground w-full"
               />
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
                 <DropdownMenuContent align="end" className="w-40">
                   <DropdownMenuItem onClick={() => onContextMenuAction('delete', item.id, item.level === 0 ? 'phase' : item.level === 1 ? 'component' : item.level === 2 ? 'element' : 'task')} className="text-destructive focus:text-destructive">
                     <Trash2 className="w-3 h-3 mr-2" />
                     Delete
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};