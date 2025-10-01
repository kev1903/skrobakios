import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit2, Copy, Trash2, NotebookPen, Calendar } from 'lucide-react';
import { DatePickerCell } from './DatePickerCell';
import { DurationCell } from './DurationCell';
import { PredecessorCell } from './PredecessorCell';
import { DependencyLockIndicator } from './DependencyLockIndicator';
import { differenceInDays, addDays, subDays, format } from 'date-fns';
import { WBSItem, WBSPredecessor } from '@/types/wbs';
import { autoScheduleDependentWBSTasks } from '@/utils/wbsPredecessorUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// Extended interface to include fields needed by this component
interface WBSTimeItem extends WBSItem {
  name: string; // Legacy compatibility
}

interface WBSTimeRightPanelProps {
  items: WBSItem[];
  onItemUpdate: (itemId: string, updates: any) => Promise<void> | void;
  onContextMenuAction: (action: string, itemId: string, type: string) => void;
  onOpenNotesDialog: (item: any) => void;
  onClearAllDates?: () => void;
  EditableCell: any;
  StatusSelect: any;
  scrollRef?: React.RefObject<HTMLDivElement>;
  onScroll?: () => void;
  hoveredId?: string | null;
  onRowHover?: (id: string | null) => void;
  selectedItems?: string[];
  onRowClick?: (itemId: string, ctrlKey?: boolean) => void;
}

export const WBSTimeRightPanel = ({
  items,
  onItemUpdate,
  onContextMenuAction,
  onOpenNotesDialog,
  onClearAllDates,
  EditableCell,
  StatusSelect,
  scrollRef,
  onScroll,
  hoveredId,
  onRowHover,
  selectedItems = [],
  onRowClick
}: WBSTimeRightPanelProps) => {

  const timeoutRef = React.useRef<NodeJS.Timeout>();

  // Simplified handler for flat structure - no rollup calculations
  const handleItemUpdate = React.useCallback(async (itemId: string, updates: any) => {
    // Check if this task has Finish-to-Start predecessors that should lock its start date
    const item = items.find(i => i.id === itemId);
    const hasFinishToStartDeps = item?.predecessors?.some(p => p.type === 'FS');
    
    // If trying to update start_date on a task with FS dependencies, validate against constraints
    if (updates.start_date && hasFinishToStartDeps) {
      const flatItems = items.reduce<WBSItem[]>((acc, item) => {
        const flatten = (i: WBSItem): WBSItem[] => [i, ...(i.children || []).flatMap(flatten)];
        return [...acc, ...flatten(item)];
      }, []);
      
      const { calculateWBSEarliestStartDate } = await import('@/utils/wbsPredecessorUtils');
      const earliestStart = calculateWBSEarliestStartDate(item!, flatItems);
      
      if (earliestStart && new Date(updates.start_date) < earliestStart) {
        // Show warning and lock to earliest start
        console.warn(`⚠️ Start date locked due to Finish-to-Start dependency. Earliest start: ${format(earliestStart, 'yyyy-MM-dd')}`);
        updates.start_date = format(earliestStart, 'yyyy-MM-dd');
        
        // Update end date to maintain duration
        if (item?.duration) {
          const newEndDate = addDays(earliestStart, item.duration - 1);
          updates.end_date = format(newEndDate, 'yyyy-MM-dd');
        }
      }
    }

    await onItemUpdate(itemId, updates);
    
    // Handle predecessor updates with auto-scheduling
    if (updates.predecessors) {
      const flatItems = items.reduce<WBSItem[]>((acc, item) => {
        const flatten = (i: WBSItem): WBSItem[] => [i, ...(i.children || []).flatMap(flatten)];
        return [...acc, ...flatten(item)];
      }, []);
      
      await autoScheduleDependentWBSTasks(itemId, flatItems, (id, updates) => 
        Promise.resolve(onItemUpdate(id, updates))
      );
    }
    
    // Handle date changes with auto-scheduling for dependents
    if (updates.start_date || updates.end_date || updates.duration) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(async () => {
        console.log(`📅 Date change detected for ${itemId}:`, updates);
        // Auto-schedule dependent tasks when predecessor finish date changes
        const flatItems = items.reduce<WBSItem[]>((acc, item) => {
          const flatten = (i: WBSItem): WBSItem[] => [i, ...(i.children || []).flatMap(flatten)];
          return [...acc, ...flatten(item)];
        }, []);
        
        await autoScheduleDependentWBSTasks(itemId, flatItems, (id, updates) => 
          Promise.resolve(onItemUpdate(id, updates))
        );
      }, 200);
    }
  }, [items, onItemUpdate]);

  // Cleanup
  React.useEffect(() => () => timeoutRef.current && clearTimeout(timeoutRef.current), []);

  // Memoized date and duration handlers
  const handleDateCalculation = React.useCallback((id: string, field: string, value: string, currentItem: any) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const updates: any = { [field]: value };
    
    if (field === 'start_date' && item.end_date) {
      updates.duration = Math.max(1, differenceInDays(new Date(item.end_date), new Date(value)) + 1);
    } else if (field === 'start_date' && item.duration) {
      const endDate = addDays(new Date(value), item.duration - 1);
      updates.end_date = endDate.toISOString().split('T')[0];
    } else if (field === 'end_date' && item.start_date) {
      updates.duration = Math.max(1, differenceInDays(new Date(value), new Date(item.start_date)) + 1);
    } else if (field === 'end_date' && item.duration) {
      const startDate = subDays(new Date(value), item.duration - 1);
      updates.start_date = startDate.toISOString().split('T')[0];
    }

    handleItemUpdate(id, updates);
  }, [items, handleItemUpdate]);

  const handleDurationCalculation = React.useCallback((id: string, field: string, value: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const updates: any = { [field]: value };

    if (field === 'duration' && value > 0) {
      if (item.start_date) {
        const endDate = addDays(new Date(item.start_date), value - 1);
        updates.end_date = endDate.toISOString().split('T')[0];
      } else if (item.end_date) {
        const startDate = subDays(new Date(item.end_date), value - 1);
        updates.start_date = startDate.toISOString().split('T')[0];
      }
    }

    handleItemUpdate(id, updates);
  }, [items, handleItemUpdate]);
  // Determine if we're in unified scroll mode (parent handles scrolling)
  const useUnifiedScroll = true; // Enable unified scrolling for Time tab
  
  const content = (
    <div className="h-full bg-white overflow-hidden" style={{ minWidth: '800px' }}>
      {items.map((item) => (
        <div
          key={item.id}
          className={`grid items-center w-full border-b border-slate-100 cursor-pointer transition-colors duration-150 ${
            selectedItems.includes(item.id) 
              ? 'bg-blue-50 border-l-2 border-l-blue-500' 
              : hoveredId === item.id 
                ? 'bg-slate-50' 
                : 'bg-white hover:bg-slate-50'
          }`}
          style={{
            gridTemplateColumns: '80px 140px 140px 100px 160px 140px 80px',
            height: '28px',
          }}
          onMouseEnter={() => onRowHover?.(item.id)}
          onMouseLeave={() => onRowHover?.(null)}
          onClick={(e) => onRowClick?.(item.id, e.ctrlKey || e.metaKey)}
        >
            <div className="px-3 flex items-center text-xs text-slate-600 font-medium">
              {item.wbs_id || '-'}
            </div>

            <div className="px-3 flex items-center text-xs text-slate-700">
              <div className="flex items-center w-full">
                <DatePickerCell
                  id={item.id}
                  type="task"
                  field="start_date"
                  value={item.start_date}
                  placeholder="Start date"
                  className="text-xs font-medium"
                  onUpdate={(id, field, value) => handleItemUpdate(id, { [field]: value })}
                  onCalculate={handleDateCalculation}
                  currentItem={item}
                />
                <DependencyLockIndicator item={item} field="start_date" />
              </div>
            </div>

            <div className="px-3 flex items-center text-xs text-slate-700">
              <div className="flex items-center w-full">
                <DatePickerCell
                  id={item.id}
                  type="task"
                  field="end_date"
                  value={item.end_date}
                  placeholder="End date"
                  className="text-xs font-medium"
                  onUpdate={(id, field, value) => handleItemUpdate(id, { [field]: value })}
                  onCalculate={handleDateCalculation}
                  currentItem={item}
                />
                <DependencyLockIndicator item={item} field="end_date" />
              </div>
            </div>

            <div className="px-3 flex items-center text-xs text-slate-700">
              <DurationCell
                id={item.id}
                type="task"
                value={item.duration || 0}
                className="text-xs font-medium"
                onUpdate={handleDurationCalculation}
              />
            </div>

            <div className="px-3 flex items-center text-xs text-slate-700">
              <PredecessorCell
                id={item.id}
                type="task"
                value={item.predecessors || []}
                availableItems={items.map(i => ({
                  id: i.id,
                  name: i.title,
                  wbsNumber: i.wbs_id || '',
                  level: i.level
                }))}
                allItems={items} // Pass full items for validation
                className="text-xs font-medium"
                onUpdate={async (id, field, value) => {
                  try {
                    console.log(`Updating ${field} for item ${id}:`, value);
                    
                    // Update the item with new predecessors first
                    await onItemUpdate(id, { [field]: value });
                    console.log(`✅ Successfully updated ${field} for item ${id}`);
                    
                    // Get updated flat items list
                    const flatItems = items.reduce<WBSItem[]>((acc, item) => {
                      const flatten = (i: WBSItem): WBSItem[] => [i, ...(i.children || []).flatMap(flatten)];
                      return [...acc, ...flatten(item)];
                    }, []);
                    
                    // Validate for circular dependencies
                    const { detectCircularDependencies } = await import('@/utils/wbsPredecessorUtils');
                    const hasCircular = detectCircularDependencies(id, flatItems);
                    
                    if (hasCircular) {
                      console.error('❌ Circular dependency detected - reverting changes');
                      // Revert the change if circular dependency detected
                      const originalItem = flatItems.find(i => i.id === id);
                      if (originalItem) {
                        await onItemUpdate(id, { predecessors: originalItem.predecessors || [] });
                      }
                      // Show user feedback about the circular dependency
                      if (typeof window !== 'undefined' && 'toast' in window) {
                        (window as any).toast({
                          title: "Invalid Dependencies",
                          description: "Circular dependencies are not allowed. Changes have been reverted.",
                          variant: "destructive"
                        });
                      }
                      return;
                    }
                    
                    // Auto-schedule this task based on its updated predecessors
                    if (field === 'predecessors') {
                      const { autoScheduleWBSTask } = await import('@/utils/wbsPredecessorUtils');
                      const currentItem = flatItems.find(i => i.id === id);
                      if (currentItem) {
                        // Create updated item with new predecessors for scheduling calculation
                        const itemWithNewPredecessors = { ...currentItem, predecessors: value };
                        const scheduleUpdates = autoScheduleWBSTask(itemWithNewPredecessors, flatItems);
                        
                        if (scheduleUpdates) {
                          console.log(`📅 Auto-scheduling task ${id}:`, scheduleUpdates);
                          await onItemUpdate(id, scheduleUpdates);
                          
                          // Update flatItems with the newly scheduled item for dependent task scheduling
                          const itemIndex = flatItems.findIndex(i => i.id === id);
                          if (itemIndex >= 0) {
                            flatItems[itemIndex] = { ...flatItems[itemIndex], ...scheduleUpdates, predecessors: value };
                          }
                        }
                      }
                      
                      // Auto-schedule dependent tasks based on the updated item
                      await autoScheduleDependentWBSTasks(id, flatItems, (taskId, updates) => {
                        console.log(`📅 Auto-scheduling dependent task ${taskId}:`, updates);
                        return Promise.resolve(onItemUpdate(taskId, updates));
                      });
                      
                      // Show success feedback
                      console.log(`✅ Auto-scheduling completed for task ${id} and dependencies`);
                    }
                    
                  } catch (error) {
                    console.error('❌ Error updating predecessors:', error);
                    // Show error feedback to user
                    if (typeof window !== 'undefined' && 'toast' in window) {
                      (window as any).toast({
                        title: "Update Failed",
                        description: "Failed to update predecessors. Please try again.",
                        variant: "destructive"
                      });
                    }
                  }
                }}
              />
            </div>

            <div className="px-3 flex items-center">
              <StatusSelect
                value={item.status} 
                onChange={(newStatus: string) => onItemUpdate(item.id, { status: newStatus })}
                disabled={item.hasChildren}
              />
            </div>

            <div className="px-3 flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-slate-100">
                    <MoreHorizontal className="w-3.5 h-3.5 text-slate-600" />
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
  );

  return (
    <div className="bg-white flex-shrink-0">
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