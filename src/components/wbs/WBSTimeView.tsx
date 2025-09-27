import React, { useRef, useCallback, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
import { WBSLeftPanel } from './WBSLeftPanel';
import { WBSTimeRightPanel } from './WBSTimeRightPanel';
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
  const ganttScrollRef = useRef<HTMLDivElement>(null);
  const headerHorizScrollRef = useRef<HTMLDivElement>(null);
  const bodyHorizScrollRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isSyncingRef = useRef(false);

  const handleTimelineHorizontalScroll = useCallback(() => {
    if (headerHorizScrollRef.current && bodyHorizScrollRef.current) {
      headerHorizScrollRef.current.scrollLeft = bodyHorizScrollRef.current.scrollLeft;
    }
  }, []);

  const syncScrollPosition = useCallback((scrollTop: number) => {
    if (isSyncingRef.current) return;
    
    isSyncingRef.current = true;
    
    if (leftScrollRef.current) {
      leftScrollRef.current.scrollTop = scrollTop;
    }
    if (rightScrollRef.current) {
      rightScrollRef.current.scrollTop = scrollTop;
    }
    if (ganttScrollRef.current) {
      ganttScrollRef.current.scrollTop = scrollTop;
    }
    
    setTimeout(() => {
      isSyncingRef.current = false;
    }, 10);
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!isSyncingRef.current) {
      syncScrollPosition(e.currentTarget.scrollTop);
    }
  }, [syncScrollPosition]);

  // Simplified item update handler
  const handleItemUpdate = useCallback(async (itemId: string, updates: any) => {
    await onItemUpdate(itemId, updates);
  }, [onItemUpdate]);

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
      }
    }
    
    if (days.length === 0) {
      const currentDate = new Date();
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    }
    
    return days;
  })();

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Fixed Headers */}
      <div className="h-[60px] bg-gray-50 border-b-2 border-gray-300 sticky top-0 z-40">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel Headers */}
          <ResizablePanel defaultSize={60} minSize={40} maxSize={75}>
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* WBS Structure Header */}
              <ResizablePanel defaultSize={45} minSize={25} maxSize={65}>
                <div className="h-full border-r border-gray-200 bg-gray-50 text-xs font-bold text-gray-700 shadow-sm">
                  <div className="h-full grid items-center" style={{ gridTemplateColumns: '32px 120px 1fr 40px' }}>
                    <div className="px-2 text-center"></div>
                    <div className="px-2">WBS</div>
                    <div className="px-3">NAME</div>
                    <div></div>
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle />

              {/* Data Columns Header */}
              <ResizablePanel defaultSize={55} minSize={35} maxSize={75}>
                <div className="h-full border-r border-gray-200 bg-gray-50 text-xs font-bold text-gray-700 shadow-sm">
                  <div className="h-full grid items-center" style={{ gridTemplateColumns: '120px 120px 100px 140px 140px 120px' }}>
                    <div className="px-2 text-center">START DATE</div>
                    <div className="px-2 text-center">END DATE</div>
                    <div className="px-2 text-center">DURATION</div>
                    <div className="px-2 text-center">PREDECESSORS</div>
                    <div className="px-2 text-center">STATUS</div>
                    <div className="px-2 text-center">ACTIONS</div>
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle className="w-2 hover:w-3 transition-all duration-200" />

          {/* Timeline Header */}
          <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
            <div 
              ref={bodyHorizScrollRef}
              className="h-full overflow-x-auto overflow-y-hidden bg-gray-50"
              onScroll={handleTimelineHorizontalScroll}
            >
              <div 
                ref={headerHorizScrollRef}
                className="h-full bg-gray-50 text-xs font-medium text-gray-700 shadow-sm overflow-hidden"
              >
                <div className="flex h-full min-w-fit">
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
                        className={`flex-shrink-0 flex flex-col items-center justify-center border-r border-gray-200 ${
                          isToday ? 'bg-blue-100 text-blue-800 font-bold' : 
                          isWeekend ? 'bg-gray-50 text-gray-500' : 'text-gray-700'
                        }`}
                        style={{ width: 32 }}
                      >
                        {isFirstDayOfMonth && (
                          <div className="text-[8px] font-bold mb-0.5 text-blue-600">
                            {format(day, 'MMM').toUpperCase()}
                          </div>
                        )}
                        <div className="text-[9px] font-medium mb-0.5">
                          {format(day, 'EEE').toUpperCase()}
                        </div>
                        <div className={`text-xs ${isToday ? 'font-bold' : 'font-semibold'}`}>
                          {format(day, 'd')}
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

      {/* Scrollable Content with Split Scroll Behavior */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel Content */}
          <ResizablePanel defaultSize={60} minSize={40} maxSize={75}>
            <div className="h-full flex">
              <ResizablePanelGroup direction="horizontal" className="h-full">
                {/* WBS Structure Content */}
                <ResizablePanel defaultSize={45} minSize={25} maxSize={65}>
                  <div className="h-full border-r border-gray-200 bg-white flex flex-col">
                    <div className="flex-1 overflow-hidden">
                      <div ref={leftScrollRef} className="h-full overflow-y-scroll overflow-x-hidden scrollbar-hide" onScroll={handleScroll}>
                        <WBSLeftPanel
                          items={items.map(item => ({
                            ...item,
                            name: item.title,
                            wbsNumber: item.wbs_id || '',
                            status: item.status || 'Not Started'
                          }))}
                          onToggleExpanded={onToggleExpanded}
                          onDragEnd={onDragEnd}
                          onItemEdit={onItemUpdate}
                          onAddChild={onAddChild}
                          dragIndicator={dragIndicator}
                          EditableCell={EditableCell}
                          generateWBSNumber={generateWBSNumber}
                          scrollRef={leftScrollRef}
                          onScroll={() => {}}
                          hoveredId={hoveredId}
                          onRowHover={setHoveredId}
                        />
                      </div>
                    </div>
                  </div>
                </ResizablePanel>

                <ResizableHandle />

                {/* Data Columns Content */}
                <ResizablePanel defaultSize={55} minSize={35} maxSize={75}>
                  <div className="h-full border-r border-gray-200 bg-white flex flex-col">
                    <div className="flex-1 overflow-hidden">
                      <div ref={rightScrollRef} className="h-full overflow-y-auto overflow-x-hidden" onScroll={handleScroll}>
                        <WBSTimeRightPanel
                          items={items}
                          onItemUpdate={handleItemUpdate}
                          onContextMenuAction={onContextMenuAction}
                          onOpenNotesDialog={onOpenNotesDialog}
                          onClearAllDates={onClearAllDates}
                          EditableCell={EditableCell}
                          StatusSelect={StatusSelect}
                          scrollRef={rightScrollRef}
                          onScroll={() => {}}
                          hoveredId={hoveredId}
                          onRowHover={setHoveredId}
                        />
                      </div>
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="w-2 hover:w-3 transition-all duration-200" />

          {/* Timeline Content */}
          <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
            <div 
              ref={ganttScrollRef}
              className="h-full overflow-x-auto overflow-y-auto bg-white"
              onScroll={handleScroll}
            >
              <div className="min-w-fit">
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
                  className="relative z-10" 
                  hideHeader 
                  hoveredId={hoveredId}
                  onRowHover={setHoveredId}
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};