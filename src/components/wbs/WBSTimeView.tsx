import React, { useRef, useCallback, useState, useEffect } from 'react';
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
  const wbsHeaderScrollRef = useRef<HTMLDivElement>(null);
  const wbsContentScrollRef = useRef<HTMLDivElement>(null);
  const dataHeaderScrollRef = useRef<HTMLDivElement>(null);
  const dataContentScrollRef = useRef<HTMLDivElement>(null);
  const timelineHeaderScrollRef = useRef<HTMLDivElement>(null);
  const timelineContentScrollRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Sync WBS horizontal scrolling
  const handleWBSContentScroll = useCallback(() => {
    if (wbsHeaderScrollRef.current && wbsContentScrollRef.current) {
      wbsHeaderScrollRef.current.scrollLeft = wbsContentScrollRef.current.scrollLeft;
    }
  }, []);

  // Sync Data Columns horizontal scrolling
  const handleDataContentScroll = useCallback(() => {
    if (dataHeaderScrollRef.current && dataContentScrollRef.current) {
      dataHeaderScrollRef.current.scrollLeft = dataContentScrollRef.current.scrollLeft;
    }
  }, []);

  // Sync Timeline horizontal scrolling
  const handleTimelineContentScroll = useCallback(() => {
    if (timelineHeaderScrollRef.current && timelineContentScrollRef.current) {
      timelineHeaderScrollRef.current.scrollLeft = timelineContentScrollRef.current.scrollLeft;
    }
  }, []);

  // Sync all scrolling when any content area scrolls
  const handleSyncScroll = useCallback((source: 'wbs' | 'data' | 'timeline') => {
    requestAnimationFrame(() => {
      switch (source) {
        case 'wbs':
          handleWBSContentScroll();
          break;
        case 'data':
          handleDataContentScroll();
          break;
        case 'timeline':
          handleTimelineContentScroll();
          break;
      }
    });
  }, [handleWBSContentScroll, handleDataContentScroll, handleTimelineContentScroll]);

  // Effect to handle panel resize and maintain header alignment
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      // Force scroll sync when panels are resized
      requestAnimationFrame(() => {
        handleSyncScroll('wbs');
        handleSyncScroll('data');
        handleSyncScroll('timeline');
      });
    });

    // Observe all panel elements
    const panels = [
      wbsHeaderScrollRef.current?.parentElement,
      dataHeaderScrollRef.current?.parentElement,
      timelineHeaderScrollRef.current?.parentElement,
      wbsContentScrollRef.current?.parentElement,
      dataContentScrollRef.current?.parentElement,
      timelineContentScrollRef.current?.parentElement
    ].filter(Boolean) as Element[];

    panels.forEach(panel => resizeObserver.observe(panel));

    return () => {
      panels.forEach(panel => resizeObserver.unobserve(panel));
    };
  }, [handleSyncScroll]);

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
    <div className="h-full w-full bg-white flex flex-col relative z-10">
      {/* Combined Header and Content Area - Scrollable Together */}
      <div 
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500" 
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        <ResizablePanelGroup direction="horizontal" className="min-h-full">
          {/* Left Side - WBS Structure + Data Columns */}
          <ResizablePanel defaultSize={60} minSize={40} maxSize={75}>
            <ResizablePanelGroup direction="horizontal" className="min-h-full">
              {/* WBS Section */}
              <ResizablePanel defaultSize={45} minSize={25} maxSize={65}>
                <div className="min-h-full border-r border-gray-200">
                  <div 
                    ref={wbsContentScrollRef}
                    className="overflow-x-auto overflow-y-hidden"
                    onScroll={() => handleSyncScroll('wbs')}
                  >
                    {/* WBS Header */}
                    <div className="h-[60px] bg-gray-50 border-b-2 border-gray-300 sticky top-0 z-30">
                      <div 
                        ref={wbsHeaderScrollRef}
                        className="h-full overflow-x-auto overflow-y-hidden text-xs font-bold text-gray-700 shadow-sm scrollbar-hide"
                      >
                        <div className="h-full grid items-center min-w-fit" style={{ gridTemplateColumns: '32px 120px 1fr 40px' }}>
                          <div className="px-2 text-center"></div>
                          <div className="px-2">WBS</div>
                          <div className="px-3">NAME</div>
                          <div></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* WBS Content */}
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
                      hoveredId={hoveredId}
                      onRowHover={setHoveredId}
                    />
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle />

              {/* Data Columns Section */}
              <ResizablePanel defaultSize={55} minSize={35} maxSize={75}>
                <div className="min-h-full border-r border-gray-200">
                  <div 
                    ref={dataContentScrollRef}
                    className="overflow-x-auto overflow-y-hidden"
                    onScroll={() => handleSyncScroll('data')}
                  >
                    {/* Data Columns Header */}
                    <div className="h-[60px] bg-gray-50 border-b-2 border-gray-300 sticky top-0 z-30">
                      <div 
                        ref={dataHeaderScrollRef}
                        className="h-full overflow-x-auto overflow-y-hidden text-xs font-bold text-gray-700 shadow-sm scrollbar-hide"
                      >
                        <div className="h-full grid items-center min-w-fit" style={{ gridTemplateColumns: '120px 120px 100px 140px 140px 120px' }}>
                          <div className="px-2 text-center">START DATE</div>
                          <div className="px-2 text-center">END DATE</div>
                          <div className="px-2 text-center">DURATION</div>
                          <div className="px-2 text-center">PREDECESSORS</div>
                          <div className="px-2 text-center">STATUS</div>
                          <div className="px-2 text-center">ACTIONS</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Data Columns Content */}
                    <WBSTimeRightPanel
                      items={items}
                      onItemUpdate={handleItemUpdate}
                      onContextMenuAction={onContextMenuAction}
                      onOpenNotesDialog={onOpenNotesDialog}
                      onClearAllDates={onClearAllDates}
                      EditableCell={EditableCell}
                      StatusSelect={StatusSelect}
                      hoveredId={hoveredId}
                      onRowHover={setHoveredId}
                    />
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle className="w-2 hover:w-3 transition-all duration-200" />

          {/* Timeline Section */}
          <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
            <div className="min-h-full relative overflow-hidden">
              <div 
                ref={timelineContentScrollRef}
                className="overflow-x-auto overflow-y-hidden h-full"
                onScroll={() => handleSyncScroll('timeline')}
              >
                {/* Timeline Header */}
                <div className="h-[60px] bg-gray-50 border-b-2 border-gray-300 sticky top-0 z-30">
                  <div 
                    ref={timelineHeaderScrollRef}
                    className="h-full overflow-x-auto overflow-y-hidden scrollbar-hide"
                  >
                    <div 
                      className="h-full text-xs font-medium text-gray-700 shadow-sm"
                      style={{ width: `${timelineDays.length * 32}px`, minWidth: `${timelineDays.length * 32}px` }}
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
                </div>
                
                {/* Timeline Content */}
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
                  className="relative z-20" 
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