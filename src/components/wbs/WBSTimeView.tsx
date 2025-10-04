import React, { useRef, useCallback, useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
import { WBSLeftPanel } from './WBSLeftPanel';
import { WBSTimeRightPanel } from './WBSTimeRightPanel';
import { WBSToolbar } from './WBSToolbar';
import { SimpleGanttChart } from './SimpleGanttChart';
import { TimeViewHeader } from './TimeViewHeader';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { DropResult } from 'react-beautiful-dnd';
import { WBSItem } from '@/types/wbs';
import { renumberAllWBSItems } from '@/utils/wbsUtils';

interface WBSTimeViewProps {
  items: WBSItem[];
  onToggleExpanded: (itemId: string) => void;
  onDragEnd: (result: DropResult) => void;
  onItemUpdate: (itemId: string, updates: any) => void;
  onAddChild?: (parentId: string) => void;
  onContextMenuAction: (action: string, itemId: string, type: string) => void;
  onOpenNotesDialog: (item: any) => void;
  onClearAllDates?: () => void;
  onAddRow?: () => void;
  onReloadItems?: () => Promise<void>;
  dragIndicator: any;
  EditableCell: any;
  StatusSelect: any;
  generateWBSNumber: (phaseIndex: number, componentIndex?: number, elementIndex?: number) => string;
}

export const WBSTimeView = ({
  items,
  onToggleExpanded,
  onDragEnd,
  onItemUpdate,
  onAddChild,
  onContextMenuAction,
  onOpenNotesDialog,
  onClearAllDates,
  onAddRow,
  onReloadItems,
  dragIndicator,
  EditableCell,
  StatusSelect,
  generateWBSNumber
}: WBSTimeViewProps) => {
  const wbsContentScrollRef = useRef<HTMLDivElement>(null);
  const dataColumnsScrollRef = useRef<HTMLDivElement>(null);
  const dataColumnsHeaderScrollRef = useRef<HTMLDivElement>(null);
  const timelineContentContainerRef = useRef<HTMLDivElement>(null);
  const timelineContentScrollRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [rightPanelSizes, setRightPanelSizes] = useState([50, 50]); // [dataColumns, timeline]
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentFormatting, setCurrentFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    fontSize: "12"
  });
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [showBaseline, setShowBaseline] = useState(false);
  const isSyncingRef = useRef(false);
  const isHorizontalSyncingRef = useRef(false);

  // Calculate project progress
  const projectProgress = React.useMemo(() => {
    const itemsWithProgress = items.filter(item => item.level === 2); // Only elements
    if (itemsWithProgress.length === 0) return 0;
    const totalProgress = itemsWithProgress.reduce((sum, item) => sum + (item.progress || 0), 0);
    return Math.round(totalProgress / itemsWithProgress.length);
  }, [items]);

  // Master scroll handler - Timeline section controls all scrolling
  const handleMasterScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    
    const scrollTop = e.currentTarget.scrollTop;
    if (wbsContentScrollRef.current) {
      wbsContentScrollRef.current.scrollTop = scrollTop;
    }
    if (dataColumnsScrollRef.current) {
      dataColumnsScrollRef.current.scrollTop = scrollTop;
    }
    
    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  }, []);

  // Simplified timeline scroll handler - no separate header sync needed
  const handleTimelineScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    // Timeline header and content are now unified in one container
    // No additional synchronization needed
  }, []);

  // Unified data columns scroll handler - syncs header and content together
  const handleDataColumnsScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (isHorizontalSyncingRef.current) return;
    isHorizontalSyncingRef.current = true;
    
    const scrollLeft = e.currentTarget.scrollLeft;
    
    // Sync header when content scrolls
    if (dataColumnsHeaderScrollRef.current) {
      dataColumnsHeaderScrollRef.current.scrollLeft = scrollLeft;
    }
    
    // Sync content when header scrolls  
    if (dataColumnsScrollRef.current && dataColumnsScrollRef.current !== e.currentTarget) {
      dataColumnsScrollRef.current.scrollLeft = scrollLeft;
    }
    
    requestAnimationFrame(() => {
      isHorizontalSyncingRef.current = false;
    });
  }, []);

  // Simplified item update handler
  const handleItemUpdate = useCallback(async (itemId: string, updates: any) => {
    await onItemUpdate(itemId, updates);
  }, [onItemUpdate]);

  // Toolbar handlers
  const handleAddRow = useCallback(() => {
    if (onAddRow) {
      onAddRow();
    }
  }, [onAddRow]);

  const handleIndent = useCallback(async () => {
    if (selectedItems.length === 0) return;
    
    try {
      console.log('🔵 Starting progressive indent operation for items:', selectedItems);
      
      // Helper function to get all descendants of an item
      const getAllDescendants = (itemId: string): string[] => {
        const descendants: string[] = [];
        const children = items.filter(i => i.parent_id === itemId);
        
        children.forEach(child => {
          descendants.push(child.id);
          descendants.push(...getAllDescendants(child.id));
        });
        
        return descendants;
      };
      
      // Helper to find the appropriate parent for a given level
      const findParentForLevel = (currentIndex: number, targetLevel: number): string | null => {
        // Look backwards to find an item at level (targetLevel - 1)
        for (let i = currentIndex - 1; i >= 0; i--) {
          const potentialParent = items[i];
          if (potentialParent.level === targetLevel - 1) {
            return potentialParent.id;
          }
        }
        return null;
      };
      
      // Process each selected item and its descendants
      for (const itemId of selectedItems) {
        const item = items.find(i => i.id === itemId);
        if (!item) continue;
        
        const currentIndex = items.findIndex(i => i.id === itemId);
        if (currentIndex < 0) continue;
        
        // Check maximum level restriction (allow up to level 4, since we start from 0)
        if (item.level >= 4) {
          console.log(`🚫 Cannot indent ${item.title || item.id} - maximum level (4) reached`);
          continue;
        }
        
        const newLevel = item.level + 1;
        const newParentId = findParentForLevel(currentIndex, newLevel);
        
        console.log(`🔄 Progressive indent: ${item.title || item.id} from level ${item.level} to ${newLevel}, new parent: ${newParentId}`);
        
        // Indent the item by one level
        await onItemUpdate(itemId, {
          parent_id: newParentId,
          level: newLevel
        });
        
        // Get all descendants and indent them too
        const descendants = getAllDescendants(itemId);
        console.log(`📂 Found ${descendants.length} descendants to cascade indent:`, descendants);
        
        for (const descendantId of descendants) {
          const descendant = items.find(i => i.id === descendantId);
          if (descendant) {
            console.log(`🔄 Cascading indent to ${descendant.title || descendant.id} (level ${descendant.level} → ${descendant.level + 1})`);
            await onItemUpdate(descendantId, {
              level: descendant.level + 1
            });
          }
        }
      }
      
      // Auto-renumber WBS after indent operations
      const updates = renumberAllWBSItems(items);
      for (const update of updates) {
        await onItemUpdate(update.item.id, { wbs_id: update.newWbsId });
      }
      
      // Clear selection after indent
      setSelectedItems([]);
      
      // Reload items from database to rebuild hierarchy
      if (onReloadItems) {
        await onReloadItems();
      }
      
      console.log('✅ Cascade indent operation completed with WBS renumbering');
    } catch (error) {
      console.error('❌ Error in cascade indent operation:', error);
    }
  }, [selectedItems, items, onItemUpdate, onReloadItems]);

  const handleOutdent = useCallback(async () => {
    if (selectedItems.length === 0) return;
    
    try {
      console.log('🟡 Starting cascade outdent operation for items:', selectedItems);
      
      // Helper function to get all descendants of an item
      const getAllDescendants = (itemId: string): string[] => {
        const descendants: string[] = [];
        const children = items.filter(i => i.parent_id === itemId);
        
        children.forEach(child => {
          descendants.push(child.id);
          descendants.push(...getAllDescendants(child.id));
        });
        
        return descendants;
      };
      
      // Process each selected item and its descendants
      for (const itemId of selectedItems) {
        const item = items.find(i => i.id === itemId);
        if (!item || item.level <= 0) continue; // Can't outdent beyond level 0
        
        // Find the current parent to get its parent
        const currentParent = items.find(i => i.id === item.parent_id);
        
        console.log(`🔄 Outdenting parent item ${item.title || item.id} from level ${item.level} to ${item.level - 1}`);
        
        // Outdent the parent item
        await onItemUpdate(itemId, {
          parent_id: currentParent?.parent_id || null,
          level: Math.max(0, item.level - 1)
        });
        
        // Get all descendants and outdent them too
        const descendants = getAllDescendants(itemId);
        console.log(`📂 Found ${descendants.length} descendants to cascade outdent:`, descendants);
        
        for (const descendantId of descendants) {
          const descendant = items.find(i => i.id === descendantId);
          if (descendant) {
            console.log(`🔄 Cascading outdent to ${descendant.title || descendant.id} (level ${descendant.level} → ${Math.max(0, descendant.level - 1)})`);
            await onItemUpdate(descendantId, {
              level: Math.max(0, descendant.level - 1)
            });
          }
        }
      }
      
      // Auto-renumber WBS after outdent operations
      const updates = renumberAllWBSItems(items);
      for (const update of updates) {
        await onItemUpdate(update.item.id, { wbs_id: update.newWbsId });
      }
      
      // Clear selection after outdent
      setSelectedItems([]);
      
      // Reload items from database to rebuild hierarchy
      if (onReloadItems) {
        await onReloadItems();
      }
      
      console.log('✅ Cascade outdent operation completed with WBS renumbering');
    } catch (error) {
      console.error('❌ Error in cascade outdent operation:', error);
    }
  }, [selectedItems, items, onItemUpdate, onReloadItems]);

  const handleBold = useCallback(() => {
    setCurrentFormatting(prev => ({ ...prev, bold: !prev.bold }));
    // Apply bold formatting to selected items
    selectedItems.forEach(itemId => {
      // Could implement text formatting logic here
      console.log('Toggle bold for item:', itemId);
    });
  }, [selectedItems]);

  const handleItalic = useCallback(() => {
    setCurrentFormatting(prev => ({ ...prev, italic: !prev.italic }));
    // Apply italic formatting to selected items
    selectedItems.forEach(itemId => {
      console.log('Toggle italic for item:', itemId);
    });
  }, [selectedItems]);

  const handleUnderline = useCallback(() => {
    setCurrentFormatting(prev => ({ ...prev, underline: !prev.underline }));
    // Apply underline formatting to selected items
    selectedItems.forEach(itemId => {
      console.log('Toggle underline for item:', itemId);
    });
  }, [selectedItems]);

  const handleFontSizeChange = useCallback((size: string) => {
    setCurrentFormatting(prev => ({ ...prev, fontSize: size }));
    // Apply font size to selected items
    selectedItems.forEach(itemId => {
      console.log('Change font size for item:', itemId, 'to:', size);
    });
  }, [selectedItems]);

  // Enhanced row hover handler to support selection
  const handleRowHover = useCallback((id: string | null) => {
    setHoveredId(id);
  }, []);

  // Memoized Gantt chart callbacks to prevent unnecessary re-renders
  const handleGanttDateChange = useCallback((task: any, start: Date, end: Date) => {
    handleItemUpdate(task.id, {
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0]
    });
  }, [handleItemUpdate]);

  const handleGanttProgressChange = useCallback((task: any, progress: number) => {
    handleItemUpdate(task.id, {
      progress: progress
    });
  }, [handleItemUpdate]);

  const handleRowClick = useCallback((itemId: string, ctrlKey: boolean = false) => {
    if (ctrlKey) {
      // Multi-select with Ctrl
      setSelectedItems(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      // Single select
      setSelectedItems([itemId]);
    }
  }, []);

  // Keyboard navigation for row selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if we have items and aren't in an input field
      if (items.length === 0 || (e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      // Helper to check if item is visible (all ancestors are expanded)
      const isItemVisible = (itemId: string): boolean => {
        const item = items.find(i => i.id === itemId);
        if (!item) return false;
        
        // Check all ancestors are expanded
        let currentParentId = item.parent_id;
        while (currentParentId) {
          const parent = items.find(i => i.id === currentParentId);
          if (!parent) break;
          if (parent.is_expanded === false) return false;
          currentParentId = parent.parent_id;
        }
        return true;
      };

      // Get visible items
      const visibleItems = items.filter(item => isItemVisible(item.id));

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        
        const currentSelectedId = selectedItems.length > 0 ? selectedItems[selectedItems.length - 1] : null;
        const currentIndex = currentSelectedId ? visibleItems.findIndex(item => item.id === currentSelectedId) : -1;

        let newIndex = -1;
        
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          // Move down or Enter (next row)
          if (currentIndex === -1) {
            newIndex = 0; // Select first item if nothing selected
          } else if (currentIndex < visibleItems.length - 1) {
            newIndex = currentIndex + 1;
          }
        } else if (e.key === 'ArrowUp') {
          // Move up
          if (currentIndex === -1) {
            newIndex = 0; // Select first item if nothing selected
          } else if (currentIndex > 0) {
            newIndex = currentIndex - 1;
          }
        }

        if (newIndex >= 0 && newIndex < visibleItems.length) {
          const newSelectedItem = visibleItems[newIndex];
          setSelectedItems([newSelectedItem.id]);

          // Scroll selected item into view
          setTimeout(() => {
            const rowElement = document.querySelector(`[data-row-id="${newSelectedItem.id}"]`);
            if (rowElement) {
              rowElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedItems]);

  // Generate timeline days for consistent layout
  const timelineDays = (() => {
    const itemsWithDates = items.filter(item => item.start_date || item.end_date);
    let days: Date[] = [];
    
    if (itemsWithDates.length > 0) {
      const dates = itemsWithDates
        .flatMap(item => [
          item.start_date ? (typeof item.start_date === 'string' ? new Date(item.start_date) : item.start_date) : null,
          item.end_date ? (typeof item.end_date === 'string' ? new Date(item.end_date) : item.end_date) : null
        ])
        .filter(Boolean) as Date[];
      
      if (dates.length > 0) {
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
        const chartStart = startOfWeek(minDate);
        const chartEnd = endOfWeek(addDays(maxDate, 14));
        days = eachDayOfInterval({ start: chartStart, end: chartEnd });
        
        // Limit to maximum 90 days to prevent excessive width
        if (days.length > 90) {
          days = days.slice(0, 90);
        }
      }
    }
    
    if (days.length === 0) {
      const currentDate = new Date();
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(addMonths(currentDate, 1)); // Show 2 months by default
      days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    }
    
    return days;
  })();

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Enhanced Time View Header */}
      <TimeViewHeader
        projectProgress={projectProgress}
        showCriticalPath={showCriticalPath}
        showBaseline={showBaseline}
        onToggleCriticalPath={() => setShowCriticalPath(!showCriticalPath)}
        onToggleBaseline={() => setShowBaseline(!showBaseline)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Toolbar */}
      <WBSToolbar
        onAddRow={handleAddRow}
        onIndent={handleIndent}
        onOutdent={handleOutdent}
        onBold={handleBold}
        onItalic={handleItalic}
        onUnderline={handleUnderline}
        onFontSizeChange={handleFontSizeChange}
        selectedItems={selectedItems}
        canIndent={selectedItems.length > 0 && selectedItems.some(id => {
          const item = items.find(i => i.id === id);
          return item && item.level < 4; // Can only indent if not at max level (4)
        })}
        canOutdent={selectedItems.length > 0 && selectedItems.some(id => {
          const item = items.find(i => i.id === id);
          return item && item.level > 0; // Can only outdent if not at root level (0)
        })}
        currentFormatting={currentFormatting}
      />
      
      {/* Three-panel layout: WBS Names | Data Columns | Gantt Chart */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Column (WBS + Names) */}
        <ResizablePanel defaultSize={25} minSize={15} maxSize={35}>
          <div className="h-full flex flex-col">
            {/* Left Header - Enhanced Professional Styling */}
            <div className="h-12 bg-slate-50 border-b-2 border-slate-300 border-r border-slate-200 sticky top-0 z-40">
              <div className="px-3 h-full flex items-center">
                <div className="grid items-center h-full w-full" style={{
                  gridTemplateColumns: '32px 70px 1fr 40px',
                }}>
                  <div></div>
                  <div className="px-3 font-semibold text-[10px] uppercase tracking-wider text-slate-600">
                    WBS
                  </div>
                  <div className="px-2 font-semibold text-[10px] uppercase tracking-wider text-slate-600">
                    Activity
                  </div>
                  <div></div>
                </div>
              </div>
            </div>
            
            {/* Left Content - no scroll handler, controlled by master scroll */}
            <div 
              ref={wbsContentScrollRef}
              className="flex-1 overflow-y-hidden overflow-x-hidden scrollbar-hide"
            >
              <WBSLeftPanel
                items={items.map(item => ({
                  ...item,
                  name: item.title || '',
                  status: item.status || 'Not Started',
                  isExpanded: item.is_expanded !== false, // Normalized at service level
                  hasChildren: items.some(child => child.parent_id === item.id)
                }))}
                onToggleExpanded={onToggleExpanded}
                onDragEnd={onDragEnd}
                onItemEdit={onItemUpdate}
                onAddChild={onAddChild}
                onContextMenuAction={(action, itemId) => {
                  const item = items.find(i => i.id === itemId);
                  const type = item?.level === 0 ? 'phase' : item?.level === 1 ? 'component' : item?.level === 2 ? 'element' : 'task';
                  onContextMenuAction(action, itemId, type);
                }}
                dragIndicator={dragIndicator}
                EditableCell={EditableCell}
                generateWBSNumber={generateWBSNumber}
                hoveredId={hoveredId}
                onRowHover={handleRowHover}
                selectedItems={selectedItems}
                onRowClick={handleRowClick}
              />
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle />
        
        {/* Middle Column (Data Columns) */}
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
          <div className="h-full flex flex-col">
            {/* Data Columns Header - Enhanced Professional Styling */}
            <div className="h-12 bg-slate-50 border-b-2 border-slate-300 sticky top-0 z-40">
              <div 
                ref={dataColumnsHeaderScrollRef}
                className="px-2 h-full overflow-x-auto scrollbar-hide flex items-center"
                onScroll={handleDataColumnsScroll}
              >
                <div className="grid items-center h-full min-w-fit" style={{
                  gridTemplateColumns: '140px 140px 100px 160px 140px 80px',
                }}>
                  <div className="px-3 font-semibold text-[10px] uppercase tracking-wider text-slate-600">Start Date</div>
                  <div className="px-3 font-semibold text-[10px] uppercase tracking-wider text-slate-600">End Date</div>
                  <div className="px-3 font-semibold text-[10px] uppercase tracking-wider text-slate-600 text-center">Duration</div>
                  <div className="px-3 font-semibold text-[10px] uppercase tracking-wider text-slate-600 text-center">Predecessors</div>
                  <div className="px-3 font-semibold text-[10px] uppercase tracking-wider text-slate-600 text-center">Status</div>
                  <div className="px-3 font-semibold text-[10px] uppercase tracking-wider text-slate-600 text-center">Actions</div>
                </div>
              </div>
            </div>
            
            {/* Data Columns Content */}
            <div 
              ref={timelineContentContainerRef}
              className="flex-1 overflow-hidden"
            >
              <div 
                ref={dataColumnsScrollRef}
                className="h-full overflow-auto"
                onScroll={(e) => {
                  handleMasterScroll(e);
                  handleDataColumnsScroll(e);
                }}
              >
                <WBSTimeRightPanel
                  items={items}
                  onItemUpdate={handleItemUpdate}
                  onContextMenuAction={onContextMenuAction}
                  onOpenNotesDialog={onOpenNotesDialog}
                  onClearAllDates={onClearAllDates}
                  EditableCell={EditableCell}
                  StatusSelect={StatusSelect}
                  hoveredId={hoveredId}
                  onRowHover={handleRowHover}
                  selectedItems={selectedItems}
                  onRowClick={handleRowClick}
                />
              </div>
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle />
        
        {/* Right Column (Gantt Chart) - Enhanced */}
        <ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
          <div className="h-full w-full flex flex-col bg-white">
            {/* Gantt Chart Content - Professional aligned with data rows */}
            <div className="flex-1 w-full overflow-auto">
              <SimpleGanttChart
                items={items}
                onDateChange={handleGanttDateChange}
                onProgressChange={handleGanttProgressChange}
                viewMode={viewMode}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};