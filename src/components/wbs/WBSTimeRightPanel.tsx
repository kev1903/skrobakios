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
      const hasDirectChild = (parent: WBSItem) => {
        // 1) Direct relation via parent_id
        if (items.some(child => child.parent_id === parent.id)) return true;
        // 2) Fallback by WBS number direct child (one more segment)
        if (parent.wbs_id) {
          const parentSegs = parent.wbs_id.split('.').length;
          const prefix = parent.wbs_id + '.';
          if (
            items.some(
              (child) =>
                child.wbs_id?.startsWith(prefix) &&
                child.wbs_id.split('.').length === parentSegs + 1
            )
          ) {
            return true;
          }
        }
        return false;
      };

      const parentsWithChildren = items.filter(
        (item) => (item.level === 0 || item.level === 1) && hasDirectChild(item as WBSItem)
      );
      
      // Calculate dates for components first, then phases
      const components = parentsWithChildren.filter(item => item.level === 1);
      const phases = parentsWithChildren.filter(item => item.level === 0);
      
      components.forEach(component => {
        setTimeout(() => calculateParentDates(component.id), 10);
      });
      
      phases.forEach(phase => {
        setTimeout(() => calculateParentDates(phase.id), 20);
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
      const parentSegs = parent.wbs_id.split('.').length;
      const prefix = parent.wbs_id + '.';
      return items.filter(
        (child) =>
          child.wbs_id?.startsWith(prefix) &&
          child.wbs_id.split('.').length === parentSegs + 1
      );
    }
    return [] as WBSItem[];
  };

  // Rollup dates for parents (display-only) from descendant elements (robust WBS prefix method)
  const rollupDates = React.useMemo(() => {
    const map = new Map<string, { start?: Date; end?: Date; duration?: number }>();

    // Helper: direct child check for leaf detection (by parent_id or WBS direct)
    const hasDirectChild = (parent: WBSItem) => {
      if (items.some((c) => c.parent_id === parent.id)) return true;
      if (parent.wbs_id) {
        const segs = parent.wbs_id.split('.').length;
        const prefix = parent.wbs_id + '.';
        if (
          items.some(
            (c) => c.wbs_id?.startsWith(prefix) && c.wbs_id.split('.').length === segs + 1
          )
        )
          return true;
      }
      return false;
    };

    // Leaves are items without direct children
    const leaves = items.filter((it) => !hasDirectChild(it));

    // Precompute leaf date ranges
    const leafRanges = leaves
      .map((leaf) => {
        const start = leaf.start_date ? new Date(leaf.start_date) : undefined;
        const end = leaf.end_date ? new Date(leaf.end_date) : undefined;
        return { leaf, start, end };
      })
      .filter((x) => x.start || x.end);

    // For every item, find descendant leaves by WBS prefix and aggregate
    items.forEach((parent) => {
      if (!parent.wbs_id) return;
      const prefix = parent.wbs_id + '.';
      const relevant = leafRanges.filter((x) => x.leaf.wbs_id?.startsWith(prefix));
      if (relevant.length === 0) return;

      const starts = relevant.map((r) => r.start).filter(Boolean) as Date[];
      const ends = relevant.map((r) => r.end).filter(Boolean) as Date[];
      if (starts.length === 0 && ends.length === 0) return;

      const start = starts.length ? new Date(Math.min(...starts.map((d) => d.getTime()))) : undefined;
      const end = ends.length ? new Date(Math.max(...ends.map((d) => d.getTime()))) : undefined;
      map.set(parent.id, {
        start,
        end,
        duration: start && end ? differenceInDays(end, start) + 1 : undefined,
      });
    });

    // Debug: surface which parents got rollups
    if (map.size > 0) {
      try {
        const debug = Array.from(map.entries()).slice(0, 10).map(([id, v]) => {
          const item = items.find((i) => i.id === id);
          return { id, wbs: item?.wbs_id, title: item?.title, start: v.start, end: v.end, duration: v.duration };
        });
        // eslint-disable-next-line no-console
        console.debug('WBSTime rollups sample', debug);
      } catch {}
    }

    return map;
  }, [items]);

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