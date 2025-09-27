import React, { useRef, useCallback, useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
import { WBSLeftPanel } from './WBSLeftPanel';
import { WBSTimeRightPanel } from './WBSTimeRightPanel';
import { WBSToolbar } from './WBSToolbar';
import { GanttChart } from './GanttChart';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { DropResult } from 'react-beautiful-dnd';
import { WBSItem } from '@/types/wbs';

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
  dragIndicator,
  EditableCell,
  StatusSelect,
  generateWBSNumber
}: WBSTimeViewProps) => {
  const wbsContentScrollRef = useRef<HTMLDivElement>(null);
  const dataColumnsScrollRef = useRef<HTMLDivElement>(null);
  const dataColumnsHeaderScrollRef = useRef<HTMLDivElement>(null);
  const timelineHeaderScrollRef = useRef<HTMLDivElement>(null);
  const timelineContentContainerRef = useRef<HTMLDivElement>(null);
  const timelineContentScrollRef = useRef<HTMLDivElement>(null);
  const timelineHeaderHorizontalScrollRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [rightPanelSizes, setRightPanelSizes] = useState([50, 50]); // [dataColumns, timeline]
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentFormatting, setCurrentFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    fontSize: "12"
  });
  const isSyncingRef = useRef(false);
  const isHorizontalSyncingRef = useRef(false);

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

  // Unified timeline scroll handler - syncs header and content together
  const handleTimelineScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (isHorizontalSyncingRef.current) return;
    isHorizontalSyncingRef.current = true;
    
    const scrollLeft = e.currentTarget.scrollLeft;
    
    // Sync header when content scrolls
    if (timelineHeaderHorizontalScrollRef.current) {
      timelineHeaderHorizontalScrollRef.current.scrollLeft = scrollLeft;
    }
    
    // Sync content when header scrolls
    if (timelineContentScrollRef.current && timelineContentScrollRef.current !== e.currentTarget) {
      timelineContentScrollRef.current.scrollLeft = scrollLeft;
    }
    
    requestAnimationFrame(() => {
      isHorizontalSyncingRef.current = false;
    });
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
      console.log('🔵 Starting cascade indent operation for items:', selectedItems);
      
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
        if (!item) continue;
        
        // Find the item directly above this one in the flat list
        const currentIndex = items.findIndex(i => i.id === itemId);
        if (currentIndex <= 0) continue; // Can't indent the first item
        
        const itemAbove = items[currentIndex - 1];
        
        console.log(`🔄 Indenting parent item ${item.title || item.id} under ${itemAbove.title || itemAbove.id}`);
        
        // Indent the parent item
        await onItemUpdate(itemId, {
          parent_id: itemAbove.id,
          level: item.level + 1
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
      
      // Clear selection after indent
      setSelectedItems([]);
      console.log('✅ Cascade indent operation completed');
    } catch (error) {
      console.error('❌ Error in cascade indent operation:', error);
    }
  }, [selectedItems, items, onItemUpdate]);

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
      
      // Clear selection after outdent
      setSelectedItems([]);
      console.log('✅ Cascade outdent operation completed');
    } catch (error) {
      console.error('❌ Error in cascade outdent operation:', error);
    }
  }, [selectedItems, items, onItemUpdate]);

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
        canIndent={selectedItems.length > 0}
        canOutdent={selectedItems.length > 0}
        currentFormatting={currentFormatting}
      />
      
      {/* Single ResizablePanelGroup controlling both header and content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Column (WBS + Names) */}
        <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
          <div className="h-full flex flex-col">
            {/* Left Header */}
            <div className="h-8 bg-slate-100/70 border-b border-slate-200 border-r border-gray-200 sticky top-0 z-40">
              <div className="px-2 py-1 text-xs font-medium text-slate-700 h-full">
                <div className="grid items-center h-full" style={{
                  gridTemplateColumns: '32px 120px 1fr 40px',
                }}>
                  <div></div>
                  <div className="px-2 font-semibold">WBS</div>
                  <div className="px-3 font-semibold">NAME</div>
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
                items={items.map(item => {
                  const mappedItem = {
                    ...item,
                    name: item.title || 'Untitled',
                    wbsNumber: item.wbs_id || '',
                    status: item.status || 'Not Started',
                    isExpanded: item.is_expanded !== false,
                    hasChildren: items.some(child => child.parent_id === item.id)
                  };
                  console.log('🔵 WBSTimeView mapping item:', item.id, 'is_expanded:', item.is_expanded, 'mapped isExpanded:', mappedItem.isExpanded);
                  return mappedItem;
                })}
                onToggleExpanded={onToggleExpanded}
                onDragEnd={onDragEnd}
                onItemEdit={onItemUpdate}
                onAddChild={onAddChild}
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
        
        {/* Right Column (Data + Timeline) */}
        <ResizablePanel defaultSize={60} minSize={40} maxSize={75}>
          <div className="h-full flex flex-col">
            {/* Right Header */}
            <div className="h-8 bg-slate-100/70 border-b border-slate-200 sticky top-0 z-40">
              <ResizablePanelGroup 
                direction="horizontal" 
                className="h-full"
                onLayout={setRightPanelSizes}
              >
                {/* Data Columns Header */}
                <ResizablePanel defaultSize={rightPanelSizes[0]} minSize={30} maxSize={70}>
                  <div 
                    ref={dataColumnsHeaderScrollRef}
                    className="px-2 py-1 text-xs font-medium text-slate-700 h-full overflow-x-auto scrollbar-hide"
                    onScroll={handleDataColumnsScroll}
                  >
                    <div className="grid items-center h-full min-w-fit" style={{
                      gridTemplateColumns: '120px 120px 100px 140px 140px 120px',
                    }}>
                      <div className="px-2 font-semibold text-center">START DATE</div>
                      <div className="px-2 font-semibold text-center">END DATE</div>
                      <div className="px-2 font-semibold text-center">DURATION</div>
                      <div className="px-2 font-semibold text-center">PREDECESSORS</div>
                      <div className="px-2 font-semibold text-center">STATUS</div>
                      <div className="px-2 font-semibold text-center">ACTIONS</div>
                    </div>
                  </div>
                </ResizablePanel>
                
                <ResizableHandle />
                
                {/* Timeline Header */}
                <ResizablePanel defaultSize={rightPanelSizes[1]} minSize={30} maxSize={70} className="timeline-header-panel">
                  <div 
                    ref={timelineHeaderHorizontalScrollRef}
                    className="h-full overflow-x-auto scrollbar-hide"
                    onScroll={handleTimelineScroll}
                    style={{ 
                      minWidth: `${timelineDays.length * 32}px`,
                      width: `${timelineDays.length * 32}px`
                    }}
                  >
                    <div 
                      className="text-xs font-medium text-gray-700 flex h-full"
                      style={{ 
                        minWidth: `${timelineDays.length * 32}px`,
                        width: `${timelineDays.length * 32}px`
                      }}
                    >
                      <div className="flex h-full">
                        {timelineDays.map((day, index) => {
                          const targetDate = new Date(2024, 10, 27);
                          const actualCurrentDate = new Date();
                          const dateToUse = timelineDays.some(d => isSameDay(d, targetDate)) ? targetDate : actualCurrentDate;
                          const isToday = isSameDay(day, dateToUse);
                          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                          const isFirstDayOfMonth = day.getDate() === 1;
                          
                          return (
                            <div 
                              key={index}
                              className={`flex-shrink-0 flex items-center justify-center border-r border-gray-200 text-[10px] font-medium ${
                                isToday ? 'bg-blue-100 text-blue-800 font-bold' : 
                                isWeekend ? 'bg-gray-50 text-gray-500' : 'text-gray-700'
                              }`}
                              style={{ width: 32, minWidth: 32, height: '32px' }}
                              title={format(day, 'EEE, MMM d, yyyy')}
                            >
                              <div className="text-center">
                                {isFirstDayOfMonth && (
                                  <div className="text-[8px] font-bold text-blue-600 leading-none">
                                    {format(day, 'MMM').toUpperCase()}
                                  </div>
                                )}
                                <div className={`text-[10px] leading-none ${isToday ? 'font-bold' : 'font-semibold'}`}>
                                  {format(day, 'd')}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
            
            {/* Right Content - Container only, no scrolling */}
            <div 
              ref={timelineContentContainerRef}
              className="flex-1 overflow-hidden"
            >
              <ResizablePanelGroup 
                direction="horizontal" 
                className="h-full"
              >
                {/* Data Columns Section - synchronized scrolling */}
                <ResizablePanel defaultSize={rightPanelSizes[0]} minSize={30} maxSize={70}>
                  <div 
                    ref={dataColumnsScrollRef}
                    className="h-full overflow-auto"
                    onScroll={handleDataColumnsScroll}
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
                </ResizablePanel>
                
                <ResizableHandle />
                
                {/* Timeline Section - Master scroll controller */}
                <ResizablePanel defaultSize={rightPanelSizes[1]} minSize={30} maxSize={70} className="timeline-content-panel">
                  <div 
                    ref={timelineContentScrollRef}
                    className="h-full overflow-y-auto overflow-x-auto scrollbar-thin"
                    onScroll={(e) => {
                      handleMasterScroll(e);
                      handleTimelineScroll(e);
                    }}
                  >
                    <div 
                      className="relative z-20 w-full"
                      style={{ 
                        minWidth: `${timelineDays.length * 32}px`,
                        width: `${timelineDays.length * 32}px`
                      }}
                    >
                      <GanttChart 
                        items={items.map(item => ({
                          ...item,
                          name: item.title,
                          wbsNumber: item.wbs_id || '',
                          status: item.status || 'Not Started',
                          predecessors: item.predecessors?.map(p => ({
                            predecessorId: p.id,
                            type: p.type,
                            lag: p.lag
                          })) || []
                        }))} 
                        timelineDays={timelineDays}
                        className="w-full" 
                        hideHeader 
                        hoveredId={hoveredId}
                        onRowHover={handleRowHover}
                      />
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};