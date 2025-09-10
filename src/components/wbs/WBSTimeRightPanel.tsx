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
  scrollRef: React.RefObject<HTMLDivElement>;
  onScroll?: () => void;
  hoveredId?: string | null;
  onRowHover?: (id: string | null) => void;
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
  onRowHover
}: WBSTimeRightPanelProps) => {

  const timeoutRef = React.useRef<NodeJS.Timeout>();
  
  // Memoized parent-child relationships for efficiency
  const parentChildMap = React.useMemo(() => {
    const map = new Map<string, string[]>();
    const parentSet = new Set<string>();
    
    items.forEach(item => {
      // Direct parent_id relationships
      if (item.parent_id) {
        if (!map.has(item.parent_id)) map.set(item.parent_id, []);
        map.get(item.parent_id)!.push(item.id);
        parentSet.add(item.parent_id);
      }
      
      // WBS-based relationships as fallback
      if (item.wbs_id) {
        const base = item.wbs_id.endsWith('.0') ? item.wbs_id.slice(0, -2) : item.wbs_id;
        const segs = base.split('.');
        if (segs.length > 1) {
          const parentBase = segs.slice(0, -1).join('.');
          const potentialParent = items.find(p => {
            if (!p.wbs_id || p.id === item.id) return false;
            const pBase = p.wbs_id.endsWith('.0') ? p.wbs_id.slice(0, -2) : p.wbs_id;
            return pBase === parentBase;
          });
          if (potentialParent && !item.parent_id) {
            if (!map.has(potentialParent.id)) map.set(potentialParent.id, []);
            map.get(potentialParent.id)!.push(item.id);
            parentSet.add(potentialParent.id);
          }
        }
      }
    });
    
    return { map, parentSet };
  }, [items]);

  // Optimized rollup calculations with caching
  const rollupDates = React.useMemo(() => {
    const cache = new Map<string, { start?: Date; end?: Date; duration?: number }>();
    const itemMap = new Map(items.map(i => [i.id, i]));
    
    const compute = (itemId: string, visited = new Set<string>()): typeof cache extends Map<any, infer T> ? T : never => {
      if (visited.has(itemId) || cache.has(itemId)) return cache.get(itemId) || {};
      visited.add(itemId);
      
      const item = itemMap.get(itemId);
      if (!item) return {};
      
      const childIds = parentChildMap.map.get(itemId) || [];
      
      // Leaf node - use actual dates
      if (childIds.length === 0) {
        const start = item.start_date ? new Date(item.start_date) : undefined;
        const end = item.end_date ? new Date(item.end_date) : undefined;
        const duration = start && end ? differenceInDays(end, start) + 1 : item.duration;
        const result = { start, end, duration };
        cache.set(itemId, result);
        return result;
      }
      
      // Parent node - aggregate from children
      const childResults = childIds.map(childId => compute(childId, new Set(visited))).filter(r => r.start || r.end);
      
      if (childResults.length === 0) {
        cache.set(itemId, {});
        return {};
      }
      
      const starts = childResults.map(r => r.start).filter(Boolean) as Date[];
      const ends = childResults.map(r => r.end).filter(Boolean) as Date[];
      
      const start = starts.length ? new Date(Math.min(...starts.map(d => d.getTime()))) : undefined;
      const end = ends.length ? new Date(Math.max(...ends.map(d => d.getTime()))) : undefined;
      const duration = start && end ? differenceInDays(end, start) + 1 : undefined;
      
      const result = { start, end, duration };
      cache.set(itemId, result);
      return result;
    };
    
    // Compute only for parents
    parentChildMap.parentSet.forEach(parentId => compute(parentId));
    
    return cache;
  }, [items, parentChildMap]);

  // Optimized parent date calculation
  const calculateParentDates = React.useCallback(async (parentId: string) => {
    const childIds = parentChildMap.map.get(parentId);
    if (!childIds?.length) return;
    
    const childrenWithDates = childIds
      .map(id => items.find(i => i.id === id))
      .filter(child => child?.start_date && child?.end_date) as typeof items;
    
    if (childrenWithDates.length === 0) return;
    
    const startTimes = childrenWithDates.map(c => new Date(c.start_date!).getTime());
    const endTimes = childrenWithDates.map(c => new Date(c.end_date!).getTime());
    
    const earliestStart = new Date(Math.min(...startTimes));
    const latestEnd = new Date(Math.max(...endTimes));
    const calculatedDuration = differenceInDays(latestEnd, earliestStart) + 1;
    
    await Promise.resolve(onItemUpdate(parentId, {
      start_date: earliestStart.toISOString().split('T')[0],
      end_date: latestEnd.toISOString().split('T')[0],
      duration: calculatedDuration
    }));
  }, [items, parentChildMap.map, onItemUpdate]);

  // Enhanced handler with Finish-to-Start dependency logic
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
        
        // Find all ancestor parents efficiently
        const updateAncestors = async (childId: string, visited = new Set<string>()) => {
          if (visited.has(childId)) return;
          visited.add(childId);
          
          const child = items.find(i => i.id === childId);
          if (!child) return;
          
          // Find direct parent
          let parentId = child.parent_id;
          
          // Fallback to WBS parent
          if (!parentId && child.wbs_id) {
            const childBase = child.wbs_id.endsWith('.0') ? child.wbs_id.slice(0, -2) : child.wbs_id;
            const childSegs = childBase.split('.');
            if (childSegs.length > 1) {
              const parentBase = childSegs.slice(0, -1).join('.');
              const parent = items.find(p => {
                if (!p.wbs_id || visited.has(p.id)) return false;
                const pBase = p.wbs_id.endsWith('.0') ? p.wbs_id.slice(0, -2) : p.wbs_id;
                return pBase === parentBase;
              });
              parentId = parent?.id;
            }
          }
          
          if (parentId && !visited.has(parentId)) {
            await calculateParentDates(parentId);
            await updateAncestors(parentId, visited);
          }
        };
        
        await updateAncestors(itemId);
      }, 200);
    }
  }, [items, onItemUpdate, calculateParentDates]);

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
  return (
    <div className="bg-white overflow-hidden" style={{ minWidth: '920px' }}>
      {/* Content */}
      <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden w-full scrollbar-hide" onScroll={onScroll}>
        {items.map((item) => (
          <div
            key={item.id}
            className={`grid items-center w-full border-b border-gray-100 ${
              item.level === 0 
                ? 'bg-gradient-to-r from-slate-100 via-blue-50 to-slate-100 hover:from-blue-50 hover:to-blue-100 border-l-[6px] border-blue-800 shadow-sm' 
                : item.level === 1
                ? 'bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 hover:from-blue-100 hover:to-blue-200 border-l-[4px] border-blue-400'
                : 'bg-white border-l-2 border-l-slate-300 hover:bg-slate-50/50'
            } transition-all duration-200 ${hoveredId === item.id ? 'bg-gradient-to-r from-gray-200/80 via-gray-100/60 to-gray-200/80 shadow-lg ring-2 ring-gray-300/50' : ''}`}
            style={{
              gridTemplateColumns: 'minmax(200px, 1fr) 120px 120px 100px 140px 140px 120px',
            }}
            onMouseEnter={() => onRowHover?.(item.id)}
            onMouseLeave={() => onRowHover?.(null)}
          >
            <div className="px-3 h-[1.75rem] flex items-center text-muted-foreground text-xs">
              <EditableCell
                id={item.id}
                type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
                field="description"
                value={item.description || ''}
                placeholder="Add description..."
                className="text-xs text-muted-foreground"
              />
            </div>

            <div className="px-2 h-[1.75rem] flex items-center text-xs text-muted-foreground">
                {(() => {
                  const type = item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element';
                  const isParent = (item.level === 0 || item.level === 1) || (parentChildMap.map.get(item.id)?.length || 0) > 0;
                  if (isParent) {
                    const rollup = rollupDates.get(item.id);
                    const d = rollup?.start;
                    return (
                      <span className="text-xs text-muted-foreground">
                        {d ? format(d, 'MMM dd, yyyy') : '-'}
                      </span>
                    );
                  }
                  return (
                    <div className="flex items-center w-full">
                      <DatePickerCell
                        id={item.id}
                        type={type}
                        field="start_date"
                        value={item.start_date}
                        placeholder="Start date"
                        className="text-xs text-muted-foreground"
                        onUpdate={(id, field, value) => handleItemUpdate(id, { [field]: value })}
                        onCalculate={handleDateCalculation}
                        currentItem={item}
                      />
                      <DependencyLockIndicator item={item} field="start_date" />
                    </div>
                  );
                })()}
            </div>

            <div className="px-2 h-[1.75rem] flex items-end text-xs text-muted-foreground">
              {(() => {
                const type = item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element';
                const isParent = (item.level === 0 || item.level === 1) || (parentChildMap.map.get(item.id)?.length || 0) > 0;
                if (isParent) {
                  const rollup = rollupDates.get(item.id);
                  const d = rollup?.end;
                  return (
                    <span className="text-xs text-muted-foreground">
                      {d ? format(d, 'MMM dd, yyyy') : '-'}
                    </span>
                  );
                }
                return (
                  <div className="flex items-center w-full">
                    <DatePickerCell
                      id={item.id}
                      type={type}
                      field="end_date"
                      value={item.end_date}
                      placeholder="End date"
                      className="text-xs text-muted-foreground"
                      onUpdate={(id, field, value) => handleItemUpdate(id, { [field]: value })}
                      onCalculate={handleDateCalculation}
                      currentItem={item}
                    />
                    <DependencyLockIndicator item={item} field="end_date" />
                  </div>
                );
              })()}
            </div>

            <div className="px-2 h-[1.75rem] flex items-end text-xs text-muted-foreground">
              {(() => {
                const type = item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element';
                const isParent = (item.level === 0 || item.level === 1) || (parentChildMap.map.get(item.id)?.length || 0) > 0;
                if (isParent) {
                  const rollup = rollupDates.get(item.id);
                  const d = rollup?.duration ?? item.duration;
                  return (
                    <div className="w-full h-full flex items-end">
                      <span className="text-xs leading-none text-muted-foreground">{d ? `${d}d` : '-'}</span>
                    </div>
                  );
                }
                return (
                  <DurationCell
                    id={item.id}
                    type={type}
                    value={item.duration || 0}
                    className="text-xs text-muted-foreground"
                    onUpdate={handleDurationCalculation}
                  />
                );
              })()}
            </div>

            <div className="px-2 h-[1.75rem] flex items-center text-xs text-muted-foreground">
              <PredecessorCell
                id={item.id}
                type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
                value={item.predecessors || []}
                availableItems={items.map(i => ({
                  id: i.id,
                  name: i.title,
                  wbsNumber: i.wbs_id || '',
                  level: i.level
                }))}
                allItems={items} // Pass full items for validation
                className="text-xs text-muted-foreground"
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

            <div className="px-2 h-[1.75rem] flex items-center">
              <StatusSelect 
                value={item.status} 
                onChange={(newStatus: string) => onItemUpdate(item.id, { status: newStatus })}
              />
            </div>

            <div className="px-2 h-[1.75rem] flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
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