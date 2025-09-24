import React, { useRef, useCallback, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, startOfWeek, endOfWeek, addDays } from 'date-fns';
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

  const handleLeftPanelScroll = useCallback(() => {
    if (leftInnerRef.current && rightScrollRef.current && mainScrollRef.current) {
      const scrollTop = leftInnerRef.current.scrollTop;
      if (rightScrollRef.current.scrollTop !== scrollTop) {
        rightScrollRef.current.scrollTop = scrollTop;
      }
      if (mainScrollRef.current.scrollTop !== scrollTop) {
        mainScrollRef.current.scrollTop = scrollTop;
      }
    }
  }, []);

  const handleMiddlePanelScroll = useCallback(() => {
    if (rightScrollRef.current && leftInnerRef.current && mainScrollRef.current) {
      const scrollTop = rightScrollRef.current.scrollTop;
      if (leftInnerRef.current.scrollTop !== scrollTop) {
        leftInnerRef.current.scrollTop = scrollTop;
      }
      if (mainScrollRef.current.scrollTop !== scrollTop) {
        mainScrollRef.current.scrollTop = scrollTop;
      }
    }
  }, []);

  const handleTimelineScroll = useCallback(() => {
    if (mainScrollRef.current && leftInnerRef.current && rightScrollRef.current) {
      const scrollTop = mainScrollRef.current.scrollTop;
      if (leftInnerRef.current.scrollTop !== scrollTop) {
        leftInnerRef.current.scrollTop = scrollTop;
      }
      if (rightScrollRef.current.scrollTop !== scrollTop) {
        rightScrollRef.current.scrollTop = scrollTop;
      }
    }
  }, []);

  return (
    <div className="h-full w-full bg-white">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        {/* Left Panel - WBS Structure and Data Columns */}
        <ResizablePanel defaultSize={60} minSize={40} maxSize={75}>
          <div className="h-full flex bg-white">
            {/* WBS Structure Column */}
            <div className="w-[300px] h-full border-r border-gray-200 bg-white overflow-hidden">
              {/* Header */}
              <div className="h-[60px] bg-gray-50 border-b-2 border-gray-300 grid items-center text-xs font-bold text-gray-700 sticky top-0 z-30 shadow-sm"
                   style={{ gridTemplateColumns: '32px 120px 1fr 40px' }}>
                <div className="px-2 text-center">WBS</div>
                <div className="px-2">WBS</div>
                <div className="px-3">NAME</div>
                <div></div>
              </div>
              
              <div className="h-[calc(100%-60px)] overflow-hidden">
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
                  scrollRef={leftInnerRef}
                  onScroll={handleLeftPanelScroll}
                  hoveredId={hoveredId}
                  onRowHover={setHoveredId}
                />
              </div>
            </div>

            {/* Data Columns */}
            <div className="flex-1 h-full border-r border-gray-200 bg-white overflow-hidden">
              {/* Header */}
              <div className="h-[60px] bg-gray-50 border-b-2 border-gray-300 grid items-center text-xs font-bold text-gray-700 sticky top-0 z-30 shadow-sm"
                   style={{ gridTemplateColumns: '120px 120px 100px 140px 140px 120px' }}>
                <div className="px-2 text-center">START DATE</div>
                <div className="px-2 text-center">END DATE</div>
                <div className="px-2 text-center">DURATION</div>
                <div className="px-2 text-center">PREDECESSORS</div>
                <div className="px-2 text-center">STATUS</div>
                <div className="px-2 text-center">ACTIONS</div>
              </div>
              
              <div className="h-[calc(100%-60px)] overflow-hidden">
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
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Panel - Calendar Timeline View */}
        <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
          <div className="h-full flex flex-col bg-white">
            {/* Calendar Header */}
            <div className="h-[60px] bg-gray-50 border-b-2 border-gray-300 text-xs font-medium text-gray-700 sticky top-0 z-30 shadow-sm overflow-hidden">
              <div 
                ref={headerHorizScrollRef}
                className="h-full overflow-x-auto overflow-y-hidden"
                onScroll={handleLeftPanelHorizontalScroll}
              >
                <div className="flex h-full min-w-fit">
                  {(() => {
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
                    
                    const dayWidth = 32;
                    
                    return days.map((day, index) => {
                      const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                      
                      return (
                        <div 
                          key={index}
                          className={`flex-shrink-0 flex flex-col items-center justify-center border-r border-gray-200 ${
                            isToday ? 'bg-blue-100 text-blue-800 font-bold' : 
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
            </div>

            {/* Timeline Content */}
            <div 
              ref={bodyHorizScrollRef}
              className="flex-1 overflow-x-auto overflow-y-auto"
              onScroll={handleLeftPanelHorizontalScroll}
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
                  className="relative z-10" 
                  hideHeader 
                  hoveredId={hoveredId}
                  onRowHover={setHoveredId}
                />
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};