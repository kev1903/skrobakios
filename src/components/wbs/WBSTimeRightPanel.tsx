import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit2, Copy, Trash2, NotebookPen } from 'lucide-react';
import { DatePickerCell } from './DatePickerCell';
import { DurationCell } from './DurationCell';
import { PredecessorCell } from './PredecessorCell';
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
  predecessors?: string[]; // Array of predecessor IDs
}

interface WBSTimeRightPanelProps {
  items: WBSItem[];
  onItemUpdate: (itemId: string, updates: any) => void;
  onContextMenuAction: (action: string, itemId: string, type: string) => void;
  onOpenNotesDialog: (item: any) => void;
  EditableCell: any;
  StatusSelect: any;
  scrollRef: React.RefObject<HTMLDivElement>;
  onScroll?: () => void;
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

  // Helper function to get children of a specific item
  const getChildren = (parentId: string) => {
    return items.filter(item => {
      const parent = items.find(p => p.id === parentId);
      if (!parent) return false;
      
      // Check if item is a direct child based on WBS hierarchy
      // This is a simplified approach - you might need to adjust based on your WBS structure
      if (parent.level === 0) {
        return item.level === 1; // Components are children of phases
      } else if (parent.level === 1) {
        return item.level === 2; // Elements are children of components  
      }
      return false;
    });
  };

  // Auto-calculate parent dates based on children
  const calculateParentDates = (parentId: string) => {
    const parent = items.find(item => item.id === parentId);
    if (!parent || parent.level === 2) return; // Only calculate for phases and components
    
    const children = getChildren(parentId);
    if (children.length === 0) return;
    
    // Filter children that have dates
    const childrenWithDates = children.filter(child => child.start_date && child.end_date);
    if (childrenWithDates.length === 0) return;
    
    // Calculate earliest start and latest end
    const startDates = childrenWithDates.map(child => new Date(child.start_date!));
    const endDates = childrenWithDates.map(child => new Date(child.end_date!));
    
    const earliestStart = new Date(Math.min(...startDates.map(d => d.getTime())));
    const latestEnd = new Date(Math.max(...endDates.map(d => d.getTime())));
    const calculatedDuration = differenceInDays(latestEnd, earliestStart) + 1;
    
    // Update parent with calculated values
    onItemUpdate(parentId, {
      start_date: `${earliestStart.getFullYear()}-${String(earliestStart.getMonth()+1).padStart(2,'0')}-${String(earliestStart.getDate()).padStart(2,'0')}`,
      end_date: `${latestEnd.getFullYear()}-${String(latestEnd.getMonth()+1).padStart(2,'0')}-${String(latestEnd.getDate()).padStart(2,'0')}`,
      duration: calculatedDuration
    });
  };

  // Enhanced onItemUpdate that triggers parent calculations
  const handleItemUpdate = (itemId: string, updates: any) => {
    // First update the item itself
    onItemUpdate(itemId, updates);
    
    // If dates or duration were updated, recalculate parent dates
    if (updates.start_date || updates.end_date || updates.duration) {
      const item = items.find(i => i.id === itemId);
      if (item) {
        // Find and update parent
        if (item.level === 2) {
          // Element updated - find parent component
          const parentComponent = items.find(p => p.level === 1); // This is simplified - you'll need proper parent lookup
          if (parentComponent) {
            setTimeout(() => calculateParentDates(parentComponent.id), 100);
            
            // Also update grandparent phase
            const grandparentPhase = items.find(p => p.level === 0);
            if (grandparentPhase) {
              setTimeout(() => calculateParentDates(grandparentPhase.id), 200);
            }
          }
        } else if (item.level === 1) {
          // Component updated - find parent phase
          const parentPhase = items.find(p => p.level === 0);
          if (parentPhase) {
            setTimeout(() => calculateParentDates(parentPhase.id), 100);
          }
        }
      }
    }
  };

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
        const diffDays = differenceInDays(endDate, startDate) + 1;
        updates.duration = Math.max(1, diffDays);
      }
      // If we have duration, calculate end_date
      else if (item.duration && item.duration > 0) {
        const startDate = new Date(value);
        const endDate = addDays(startDate, item.duration - 1);
        updates.end_date = `${endDate.getFullYear()}-${String(endDate.getMonth()+1).padStart(2,'0')}-${String(endDate.getDate()).padStart(2,'0')}`;
      }
    } else if (field === 'end_date') {
      // If we have start_date, calculate duration
      if (item.start_date) {
        const startDate = new Date(item.start_date);
        const endDate = new Date(value);
        const diffDays = differenceInDays(endDate, startDate) + 1;
        updates.duration = Math.max(1, diffDays);
      }
      // If we have duration, calculate start_date
      else if (item.duration && item.duration > 0) {
        const endDate = new Date(value);
        const startDate = subDays(endDate, item.duration - 1);
        updates.start_date = `${startDate.getFullYear()}-${String(startDate.getMonth()+1).padStart(2,'0')}-${String(startDate.getDate()).padStart(2,'0')}`;
      }
    }

    handleItemUpdate(id, updates);
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

    handleItemUpdate(id, updates);
  };
  return (
    <div className="flex-1 min-w-0 bg-white overflow-hidden">
      {/* Content */}
      <div ref={scrollRef} className="h-full overflow-hidden w-full" onScroll={onScroll}>
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
              gridTemplateColumns: 'minmax(200px, 1fr) 120px 120px 100px 140px 140px 84px',
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
                  onUpdate={(id, field, value) => handleItemUpdate(id, { [field]: value })}
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
                onUpdate={(id, field, value) => handleItemUpdate(id, { [field]: value })}
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

            <div className="px-2 py-3 min-h-[3.5rem] flex items-center text-xs text-muted-foreground">
              <PredecessorCell
                id={item.id}
                type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
                value={item.predecessors || []}
                availableItems={items.map(i => ({
                  id: i.id,
                  name: i.name,
                  wbsNumber: (i as any).wbsNumber || '',
                  level: i.level
                }))}
                className="text-xs text-muted-foreground"
                onUpdate={(id, field, value) => handleItemUpdate(id, { [field]: value })}
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