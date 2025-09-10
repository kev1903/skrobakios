import React, { useRef, useCallback, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { WBSLeftPanel } from './WBSLeftPanel';
import { WBSTimeRightPanel } from './WBSTimeRightPanel';
import { GanttChart } from './GanttChart';
import { DropResult } from 'react-beautiful-dnd';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
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
  dragIndicator,
  EditableCell,
  StatusSelect,
  generateWBSNumber
}: WBSTimeViewProps) => {
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const leftInnerRef = useRef<HTMLDivElement>(null);
  const headerHorizScrollRef = useRef<HTMLDivElement>(null);
  const bodyHorizScrollRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleLeftPanelHorizontalScroll = useCallback(() => {
    if (headerHorizScrollRef.current && bodyHorizScrollRef.current) {
      headerHorizScrollRef.current.scrollLeft = bodyHorizScrollRef.current.scrollLeft;
    }
  }, []);

  // Simplified item update handler
  const handleItemUpdate = useCallback(async (itemId: string, updates: any) => {
    await onItemUpdate(itemId, updates);
  }, [onItemUpdate]);

  const handleTimelineScroll = useCallback(() => {
    if (leftInnerRef.current && rightScrollRef.current && mainScrollRef.current) {
      const scrollTop = mainScrollRef.current.scrollTop;
      if (leftInnerRef.current.scrollTop !== scrollTop) {
        leftInnerRef.current.scrollTop = scrollTop;
      }
      if (rightScrollRef.current.scrollTop !== scrollTop) {
        rightScrollRef.current.scrollTop = scrollTop;
      }
    }
  }, []);

  const handleLeftPanelScroll = useCallback(() => {
    if (leftInnerRef.current && mainScrollRef.current && rightScrollRef.current) {
      const scrollTop = leftInnerRef.current.scrollTop;
      if (mainScrollRef.current.scrollTop !== scrollTop) {
        mainScrollRef.current.scrollTop = scrollTop;
      }
      if (rightScrollRef.current.scrollTop !== scrollTop) {
        rightScrollRef.current.scrollTop = scrollTop;
      }
    }
  }, []);

  const handleMiddlePanelScroll = useCallback(() => {
    if (rightScrollRef.current && mainScrollRef.current && leftInnerRef.current) {
      const scrollTop = rightScrollRef.current.scrollTop;
      if (mainScrollRef.current.scrollTop !== scrollTop) {
        mainScrollRef.current.scrollTop = scrollTop;
      }
      if (leftInnerRef.current.scrollTop !== scrollTop) {
        leftInnerRef.current.scrollTop = scrollTop;
      }
    }
  }, []);

  // Use actual WBS IDs from database - no fallback computation needed
  // All WBS items should have proper wbs_id values from the database

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <PanelGroup direction="horizontal" className="h-full w-full flex flex-col">
        {/* Left Panel - includes both header and content */}
        <Panel defaultSize={50} minSize={30} className="flex flex-col">
          {/* Header Section */}
          <div className="bg-white border-t border-gray-200 border-b border-gray-200 flex-shrink-0 h-[60px] flex">
            {/* Frozen WBS and NAME Header */}
            <div className="w-[420px] px-2 py-1 text-xs font-medium text-gray-700 border-r border-gray-200 flex-shrink-0 bg-white z-30">
              <div className="grid items-center h-full" style={{
                gridTemplateColumns: '32px 120px 1fr',
              }}>
                <div></div>
                <div className="px-2 font-semibold">WBS</div>
                <div className="px-3 font-semibold">NAME</div>
              </div>
            </div>
            
            {/* Scrollable Header for remaining columns */}
            <div ref={headerHorizScrollRef} className="flex-1 overflow-x-hidden overflow-y-hidden">
              <div className="py-1 text-xs font-medium text-gray-700 flex items-center min-w-fit">
                <div className="grid items-center" style={{
                  gridTemplateColumns: 'minmax(200px, 1fr) 120px 120px 100px 140px 140px 120px',
                  minWidth: '920px' // Ensure minimum width for all columns
                }}>
                  <div className="px-3 font-semibold">DESCRIPTION</div>
                  <div className="px-2 font-semibold">START DATE</div>
                  <div className="px-2 font-semibold">END DATE</div>
                  <div className="px-2 font-semibold">DURATION</div>
                  <div className="px-2 font-semibold">PREDECESSORS</div>
                  <div className="px-2 font-semibold">STATUS</div>
                  <div className="px-2 font-semibold">ACTIONS</div>
                </div>
                {onClearAllDates && (
                  <div className="ml-2 pr-2">
                    <button
                      onClick={onClearAllDates}
                      className="px-2 py-1 text-xs bg-background border border-border rounded hover:bg-accent transition-colors flex items-center gap-1"
                    >
                      <span className="w-3 h-3">🗓️</span>
                      Clear Dates
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-h-0 flex overflow-hidden">
            {/* Frozen WBS and NAME Panel */}
            <div className="w-[420px] flex-shrink-0 bg-white border-r border-gray-200 z-20 overflow-hidden">
              <div 
                ref={leftScrollRef}
                className="h-full overflow-y-hidden overflow-x-hidden"
              >
                 <WBSLeftPanel
                   items={items.map(item => ({
                     ...item,
                     name: item.title,
                     wbsNumber: item.wbs_id || '', // Use actual WBS ID from database
                     status: item.status || 'Not Started'
                   }))}
                   onToggleExpanded={onToggleExpanded}
                   onDragEnd={onDragEnd}
                   onItemEdit={onItemUpdate}
                   onAddChild={onAddChild}
                   dragIndicator={dragIndicator}
                   EditableCell={EditableCell}
                   generateWBSNumber={generateWBSNumber}
                   scrollRef={leftInnerRef}
                   onScroll={handleLeftPanelScroll}
                   hoveredId={hoveredId}
                   onRowHover={setHoveredId}
                 />
              </div>
            </div>
            
            {/* Scrollable Right Panel - Only this has visible scrollbar */}
            <div ref={bodyHorizScrollRef} className="flex-1 overflow-x-auto overflow-y-hidden" onScroll={handleLeftPanelHorizontalScroll}>
              <WBSTimeRightPanel
                items={items}
                onItemUpdate={handleItemUpdate}
                onContextMenuAction={onContextMenuAction}
                onOpenNotesDialog={onOpenNotesDialog}
                onClearAllDates={onClearAllDates}
                EditableCell={EditableCell}
                StatusSelect={StatusSelect}
                scrollRef={rightScrollRef}
                onScroll={handleMiddlePanelScroll}
                hoveredId={hoveredId}
                onRowHover={setHoveredId}
              />
            </div>
          </div>
        </Panel>

        {/* Single Resizable Handle */}
        <PanelResizeHandle className="w-2 bg-border hover:bg-accent transition-colors duration-200 cursor-col-resize flex items-center justify-center">
          <div className="w-1 h-8 bg-border rounded-full"></div>
        </PanelResizeHandle>

        {/* Right Panel - includes both header and Gantt chart */}
        <Panel defaultSize={50} minSize={30} className="flex flex-col">
          {/* Combined Header and Content with Single Scroll */}
           <div 
             ref={mainScrollRef}
             className="flex-1 overflow-x-auto overflow-y-auto"
             onScroll={handleTimelineScroll}
           >
            <div className="min-w-fit">
              {/* Header Section - Daily Calendar */}
              <div className="bg-white border-t border-gray-200 border-b border-gray-200 border-l border-gray-200 text-xs font-medium text-gray-700 sticky top-0 z-10 h-[60px]">
                <div className="flex h-full">
                  {(() => {
                    // Use the same date range as the GanttChart
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
                      }
                    }
                    
                    // Fallback to current month if no dates
                    if (days.length === 0) {
                      const currentDate = new Date();
                      const monthStart = startOfMonth(currentDate);
                      const monthEnd = endOfMonth(currentDate);
                      days = eachDayOfInterval({ start: monthStart, end: monthEnd });
                    }
                    
                    const dayWidth = 32; // Match GanttChart dayWidth
                    
                    return days.map((day, index) => {
                      const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                      
                      return (
                        <div 
                          key={index}
                          className={`flex flex-col items-center justify-center border-r border-gray-200 ${
                            isToday ? 'bg-gray-100 text-gray-800 font-bold' : 
                            isWeekend ? 'bg-gray-50 text-gray-500' : 'text-gray-700'
                          }`}
                          style={{ width: dayWidth }}
                        >
                          <div className="text-[9px] font-medium mb-0.5">
                            {format(day, 'EEE').toUpperCase()}
                          </div>
                          <div className={`text-xs ${isToday ? 'font-bold' : 'font-semibold'}`}>
                            {format(day, 'd')}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Gantt Chart Content */}
              <GanttChart 
                items={items.map(item => ({
                  ...item,
                  name: item.title,
                  wbsNumber: item.wbs_id || '', // Use actual WBS ID from database
                  status: item.status || 'Not Started',
                  predecessors: item.predecessors?.map(p => ({
                    predecessorId: p.id,
                    type: p.type,
                    lag: p.lag
                  })) || []
                }))} 
                className="min-w-fit" 
                hideHeader 
                hoveredId={hoveredId}
                onRowHover={setHoveredId}
              />
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};