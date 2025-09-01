import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit2, Copy, Trash2, NotebookPen } from 'lucide-react';
import { DatePickerCell } from './DatePickerCell';
import { DurationCell } from './DurationCell';
import { differenceInDays, addDays, subDays } from 'date-fns';
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
  start_date?: string | Date | null;
  end_date?: string | Date | null;
  duration?: number; // Duration in days
}

interface WBSTimeRightPanelProps {
  items: WBSItem[];
  onItemUpdate: (itemId: string, updates: any) => void;
  onContextMenuAction: (action: string, itemId: string, type: string) => void;
  onOpenNotesDialog: (item: any) => void;
  EditableCell: any;
  StatusSelect: any;
  scrollRef: React.RefObject<HTMLDivElement>;
  onScroll: () => void;
}

export const WBSTimeRightPanel = ({
  items,
  onItemUpdate,
  onContextMenuAction,
  onOpenNotesDialog,
  EditableCell,
  StatusSelect,
  scrollRef,
  onScroll
}: WBSTimeRightPanelProps) => {

  // Auto-calculation logic for dates and duration
  const handleDateCalculation = (id: string, field: string, value: string, currentItem: any) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const updates: any = { [field]: value };
    
    if (field === 'start_date') {
      // If we have end_date, calculate duration
      if (item.end_date) {
        const startDate = new Date(value);
        const endDate = new Date(item.end_date);
        const diffDays = differenceInDays(endDate, startDate);
        updates.duration = Math.max(0, diffDays);
      }
      // If we have duration, calculate end_date
      else if (item.duration && item.duration > 0) {
        const startDate = new Date(value);
        const endDate = addDays(startDate, item.duration);
        updates.end_date = endDate.toISOString();
      }
    } else if (field === 'end_date') {
      // If we have start_date, calculate duration
      if (item.start_date) {
        const startDate = new Date(item.start_date);
        const endDate = new Date(value);
        const diffDays = differenceInDays(endDate, startDate);
        updates.duration = Math.max(0, diffDays);
      }
      // If we have duration, calculate start_date
      else if (item.duration && item.duration > 0) {
        const endDate = new Date(value);
        const startDate = subDays(endDate, item.duration);
        updates.start_date = startDate.toISOString();
      }
    }

    onItemUpdate(id, updates);
  };

  const handleDurationCalculation = (id: string, field: string, value: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const updates: any = { [field]: value };

    if (field === 'duration' && value > 0) {
      // If we have start_date, calculate end_date
      if (item.start_date) {
        const startDate = new Date(item.start_date);
        const endDate = addDays(startDate, value);
        updates.end_date = endDate.toISOString();
      }
      // If we have end_date, calculate start_date
      else if (item.end_date) {
        const endDate = new Date(item.end_date);
        const startDate = subDays(endDate, value);
        updates.start_date = startDate.toISOString();
      }
    }

    onItemUpdate(id, updates);
  };
  return (
    <div className="flex-1 min-w-0 bg-white overflow-hidden">
      {/* Content */}
      <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden w-full" onScroll={onScroll}>
        {items.map((item) => (
          <div
            key={item.id}
            className={`grid items-center w-full ${
              item.level === 0 
                ? 'bg-primary/5 hover:bg-primary/10' 
                : item.level === 1
                ? 'bg-secondary/5 hover:bg-secondary/10'
                : 'bg-white hover:bg-slate-50/50'
            } transition-colors duration-200`}
          style={{
            gridTemplateColumns: 'minmax(200px, 1fr) 120px 120px 100px 140px 84px',
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

            <div className="px-2 py-3 min-h-[3.5rem] flex items-center text-xs text-muted-foreground">
              <DatePickerCell
                id={item.id}
                type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
                field="start_date"
                value={item.start_date}
                placeholder="Start date"
                className="text-xs text-muted-foreground"
                onUpdate={(id, field, value) => onItemUpdate(id, { [field]: value })}
                onCalculate={handleDateCalculation}
                currentItem={item}
              />
            </div>

            <div className="px-2 py-3 min-h-[3.5rem] flex items-center text-xs text-muted-foreground">
              <DatePickerCell
                id={item.id}
                type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
                field="end_date"
                value={item.end_date}
                placeholder="End date"
                className="text-xs text-muted-foreground"
                onUpdate={(id, field, value) => onItemUpdate(id, { [field]: value })}
                onCalculate={handleDateCalculation}
                currentItem={item}
              />
            </div>

            <div className="px-2 py-3 min-h-[3.5rem] flex items-center text-xs text-muted-foreground">
              <DurationCell
                id={item.id}
                type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
                value={item.duration || 0}
                className="text-xs text-muted-foreground"
                onUpdate={handleDurationCalculation}
              />
            </div>

            <div className="px-2 py-3 min-h-[3.5rem] flex items-center">
              <StatusSelect 
                value={item.status} 
                onChange={(newStatus: string) => onItemUpdate(item.id, { status: newStatus })}
              />
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