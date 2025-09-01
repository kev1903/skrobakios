import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit2, Copy, Trash2, NotebookPen } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface WBSItem {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
  assignedTo?: string;
  level: number;
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
  onScroll
}: WBSRightPanelProps) => {
  return (
    <div className="flex-1 bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-slate-100/70 border-b border-slate-200 px-2 py-2 text-xs font-medium text-slate-700">
        <div className="grid items-center" style={{
          gridTemplateColumns: '1fr 140px 120px 160px 160px 84px',
        }}>
          <div className="px-3 font-semibold">DESCRIPTION</div>
          <div className="px-2 font-semibold">STATUS</div>
          <div className="px-2 font-semibold">PROGRESS</div>
          <div className="px-2 font-semibold">ASSIGNED TO</div>
          <div className="px-2 font-semibold">NOTE</div>
          <div className="px-2 font-semibold">ACTIONS</div>
        </div>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="h-[calc(100vh-200px)] overflow-y-auto overflow-x-auto" onScroll={onScroll}>
        {items.map((item) => (
          <div
            key={item.id}
            className={`grid items-center ${
              item.level === 0 
                ? 'bg-primary/5 hover:bg-primary/10' 
                : item.level === 1
                ? 'bg-secondary/5 hover:bg-secondary/10'
                : 'bg-white hover:bg-slate-50/50'
            } transition-colors duration-200`}
            style={{
              gridTemplateColumns: '1fr 140px 120px 160px 160px 84px',
            }}
          >
            <div className="px-3 py-3 min-h-[3.5rem] flex items-center text-muted-foreground text-xs">
              <EditableCell
                id={item.id}
                type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
                field="description"
                value={item.description || ''}
                placeholder="Add description..."
                className="text-xs text-muted-foreground"
              />
            </div>

            <div className="px-2 py-3 min-h-[3.5rem] flex items-center">
              <StatusSelect 
                value={item.status} 
                onChange={(newStatus: string) => onItemUpdate(item.id, { status: newStatus })}
              />
            </div>

            <div className="px-2 py-3 min-h-[3.5rem] flex items-center">
              <div className="flex items-center gap-1">
                <div className="w-8 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${getProgressColor(item.progress)}`} 
                    style={{ width: `${item.progress}%` }} 
                  />
                </div>
                {item.level === 2 ? (
                  <ProgressInput 
                    value={item.progress} 
                    onChange={(newProgress: number) => onItemUpdate(item.id, { progress: newProgress })}
                  />
                ) : (
                  <ProgressDisplay value={item.progress} />
                )}
              </div>
            </div>

            <div className="px-2 py-3 min-h-[3.5rem] flex items-center text-muted-foreground text-xs">
              <EditableCell
                id={item.id}
                type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
                field="assignedTo"
                value={item.assignedTo || ''}
                placeholder="Assign to..."
                className="text-xs text-muted-foreground"
              />
            </div>

            <div className="px-2 py-3 min-h-[3.5rem] flex items-center text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-accent"
                  onClick={() => onOpenNotesDialog(item)}
                >
                  <NotebookPen className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                </Button>
                <span className="text-xs text-muted-foreground truncate flex-1">
                  {item.description || 'Add note...'}
                </span>
              </div>
            </div>

            <div className="px-2 py-3 min-h-[3.5rem] flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-accent">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => onContextMenuAction('edit', item.id, item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element')}>
                    <Edit2 className="w-3 h-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onContextMenuAction('duplicate', item.id, item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element')}>
                    <Copy className="w-3 h-3 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onContextMenuAction('delete', item.id, item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element')} className="text-destructive focus:text-destructive">
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