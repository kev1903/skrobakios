import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit2, Copy, Trash2, NotebookPen, Calendar } from 'lucide-react';
import { DatePickerCell } from './DatePickerCell';
import { DurationCell } from './DurationCell';
import { PredecessorCell } from './PredecessorCell';
import { differenceInDays, addDays, subDays, format } from 'date-fns';
import { WBSItem } from '@/types/wbs';
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
  predecessors?: string[]; // For predecessor management
}

interface WBSTimeRightPanelProps {
  items: WBSItem[];
  onItemUpdate: (itemId: string, updates: any) => void;
  onContextMenuAction: (action: string, itemId: string, type: string) => void;
  onOpenNotesDialog: (item: any) => void;
  onClearAllDates?: () => void;
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
  onClearAllDates,
  EditableCell,
  StatusSelect,
  scrollRef,
  onScroll
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
  const calculateParentDates = React.useCallback((parentId: string) => {
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
    
    onItemUpdate(parentId, {
      start_date: earliestStart.toISOString().split('T')[0],
      end_date: latestEnd.toISOString().split('T')[0],
      duration: calculatedDuration
    });
  }, [items, parentChildMap.map, onItemUpdate]);

  // Debounced and optimized item update handler
  const handleItemUpdate = React.useCallback((itemId: string, updates: any) => {
    onItemUpdate(itemId, updates);
    
    if (updates.start_date || updates.end_date || updates.duration) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        // Find all ancestor parents efficiently
        const updateAncestors = (childId: string, visited = new Set<string>()) => {
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
            calculateParentDates(parentId);
            updateAncestors(parentId, visited);
          }
        };
        
        updateAncestors(itemId);
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
                value={item.linked_tasks || []}
                availableItems={items.map(i => ({
                  id: i.id,
                  name: i.title,
                  wbsNumber: i.wbs_id || '',
                  level: i.level
                }))}
                className="text-xs text-muted-foreground"
                onUpdate={(id, field, value) => handleItemUpdate(id, { linked_tasks: value })}
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