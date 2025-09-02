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

  // Calculate parent dates on component mount and when items change
  React.useEffect(() => {
    const calculateAllParentDates = () => {
      // Find all phases and components that have children (by parent_id or WBS prefix)
      // Determine if an item has direct children (by parent_id or WBS direct child rule)
      const hasDirectChild = (parent: WBSItem) => {
        // Prefer explicit parent_id linkage
        if (items.some((child) => child.parent_id === parent.id)) return true;

        // Fallback by WBS numbering: direct child has exactly one more segment
        if (parent.wbs_id) {
          const parentBase = parent.wbs_id.endsWith('.0') ? parent.wbs_id.slice(0, -2) : parent.wbs_id;
          const parentSegs = parentBase.split('.').length;
          const isDirect = items.some((child) => {
            if (!child.wbs_id) return false;
            if (child.id === parent.id) return false; // avoid self as child
            const childBase = child.wbs_id.endsWith('.0') ? child.wbs_id.slice(0, -2) : child.wbs_id;
            if (!childBase.startsWith(parentBase + '.')) return false;
            const segs = childBase.split('.').length;
            return segs === parentSegs + 1;
          });
          if (isDirect) return true;
        }
        return false;
      };

      const parentsWithChildren = items.filter((item) => hasDirectChild(item as WBSItem));
      
      // Calculate for all parents (deeper first if possible)
      const sortedParents = [...parentsWithChildren].sort((a, b) => {
        const depthA = (a.wbs_id ? (a.wbs_id.endsWith('.0') ? a.wbs_id.slice(0, -2) : a.wbs_id) : '').split('.').length;
        const depthB = (b.wbs_id ? (b.wbs_id.endsWith('.0') ? b.wbs_id.slice(0, -2) : b.wbs_id) : '').split('.').length;
        return depthB - depthA; // deeper first
      });
      
      sortedParents.forEach((parent, idx) => {
        setTimeout(() => calculateParentDates(parent.id), 10 * (idx + 1));
      });
    };
    
    if (items.length > 0) {
      calculateAllParentDates();
    }
  }, [items]);

  // Helper function to get children of a specific item (by parent_id or WBS direct child)
  const getChildren = (parentId: string) => {
    const parent = items.find((i) => i.id === parentId);
    if (!parent) return [] as WBSItem[];

    // Prefer explicit parent_id linkage
    const byId = items.filter((item) => item.parent_id === parentId);
    if (byId.length > 0) return byId;

    // Fallback to WBS numbers: direct child has exactly one more segment
    if (parent.wbs_id) {
      const parentBase = parent.wbs_id.endsWith('.0') ? parent.wbs_id.slice(0, -2) : parent.wbs_id;
      const parentSegs = parentBase.split('.').length;
      return items.filter((child) => {
        if (!child.wbs_id) return false;
        if (child.id === parent.id) return false; // avoid self
        const childBase = child.wbs_id.endsWith('.0') ? child.wbs_id.slice(0, -2) : child.wbs_id;
        if (!childBase.startsWith(parentBase + '.')) return false;
        const segs = childBase.split('.').length;
        return segs === parentSegs + 1;
      });
    }
    return [] as WBSItem[];
  };

  // Rollup dates for parents using robust recursive traversal of actual children
  const rollupDates = React.useMemo(() => {
    type Roll = { start?: Date; end?: Date; duration?: number };
    const map = new Map<string, Roll>();

    // Build quick index
    const byId = new Map(items.map((i) => [i.id, i] as const));
    const memo = new Map<string, Roll>();

    const compute = (id: string): Roll => {
      if (memo.has(id)) return memo.get(id)!;
      const item = byId.get(id);
      if (!item) {
        const empty: Roll = {};
        memo.set(id, empty);
        return empty;
      }

      const children = getChildren(id);
      // Treat items with no children as leaves
      if (children.length === 0) {
        const start = item.start_date ? new Date(item.start_date) : undefined;
        const end = item.end_date ? new Date(item.end_date) : undefined;
        const duration = start && end ? differenceInDays(end, start) + 1 : item.duration;
        const leaf: Roll = { start, end, duration };
        memo.set(id, leaf);
        return leaf;
      }

      // Aggregate from descendants
      const starts: Date[] = [];
      const ends: Date[] = [];
      children.forEach((ch) => {
        const r = compute(ch.id);
        if (r.start) starts.push(r.start);
        if (r.end) ends.push(r.end);
      });

      const start = starts.length ? new Date(Math.min(...starts.map((d) => d.getTime()))) : undefined;
      const end = ends.length ? new Date(Math.max(...ends.map((d) => d.getTime()))) : undefined;
      const roll: Roll = { start, end, duration: start && end ? differenceInDays(end, start) + 1 : undefined };
      memo.set(id, roll);
      return roll;
    };

    // Compute for all parents
    items.forEach((it) => {
      if (getChildren(it.id).length > 0) {
        map.set(it.id, compute(it.id));
      }
    });

    // Diagnostics to help verify in console
    try {
      const parents = items.filter((i) => i.level < 2).length;
      const leavesWithDates = items.filter((i) => (i.level === 2 || getChildren(i.id).length === 0) && (i.start_date || i.end_date)).length;
      // eslint-disable-next-line no-console
      console.debug('WBSTime rollups stats', { parents, leavesWithDates, mapSize: map.size });
    } catch {}

    return map;
  }, [items]);

  // Auto-calculate parent dates based on children
  const calculateParentDates = (parentId: string) => {
    const parent = items.find(item => item.id === parentId);
    if (!parent) return;
    
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
      if (item && item.parent_id) {
        // Find the actual parent by parent_id
        const parent = items.find(p => p.id === item.parent_id);
        if (parent) {
          // Use a timeout to ensure the item update is processed first
          setTimeout(() => calculateParentDates(parent.id), 50);
          
          // If this is an Element (level 2), also update the grandparent Phase
          if (item.level === 2 && parent.parent_id) {
            const grandparent = items.find(gp => gp.id === parent.parent_id);
            if (grandparent) {
              setTimeout(() => calculateParentDates(grandparent.id), 100);
            }
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
        const endDate = addDays(startDate, value - 1); // Subtract 1 since duration includes start day
        updates.end_date = `${endDate.getFullYear()}-${String(endDate.getMonth()+1).padStart(2,'0')}-${String(endDate.getDate()).padStart(2,'0')}`;
      }
      // If we have end_date, calculate start_date
      else if (item.end_date) {
        const endDate = new Date(item.end_date);
        const startDate = subDays(endDate, value - 1); // Subtract 1 since duration includes end day
        updates.start_date = `${startDate.getFullYear()}-${String(startDate.getMonth()+1).padStart(2,'0')}-${String(startDate.getDate()).padStart(2,'0')}`;
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
                  const isParent = (item.level === 0 || item.level === 1) || getChildren(item.id).length > 0;
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

            <div className="px-2 h-[1.75rem] flex items-center text-xs text-muted-foreground">
              {(() => {
                const type = item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element';
                const isParent = (item.level === 0 || item.level === 1) || getChildren(item.id).length > 0;
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

            <div className="px-2 h-[1.75rem] flex items-center text-xs text-muted-foreground">
              {(() => {
                const type = item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element';
                const isParent = (item.level === 0 || item.level === 1) || getChildren(item.id).length > 0;
                if (isParent) {
                  const rollup = rollupDates.get(item.id);
                  const d = rollup?.duration ?? item.duration;
                  return (
                    <span className="text-xs text-muted-foreground">
                      {d ? `${d}d` : '-'}
                    </span>
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