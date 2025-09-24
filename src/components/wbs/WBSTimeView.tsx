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

  return (
    <div className="h-full w-full bg-white">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
          <div className="h-full flex flex-col">
            {/* Left Panel Content */}
            <div className="flex-1 min-h-0 flex overflow-hidden">
              {/* Frozen WBS and NAME Panel */}
              <div className="w-full flex-shrink-0 bg-white overflow-hidden">
                <div 
                  ref={leftScrollRef}
                  className="h-full overflow-y-auto overflow-x-hidden"
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
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle className="w-px bg-border hover:bg-accent transition-colors shadow-lg" />

        <ResizablePanel defaultSize={60} minSize={40} maxSize={75}>
          <div className="h-full flex flex-col">
            {/* Combined Header and Content with Single Scroll */}
            <div 
              ref={mainScrollRef}
              className="flex-1 overflow-x-auto overflow-y-auto"
              onScroll={handleTimelineScroll}
            >
              <div className="min-w-fit">
                {/* Header Section - Daily Calendar */}
                <div className="bg-white border-t border-gray-200 border-b-2 border-gray-300 border-l border-gray-200 text-xs font-medium text-gray-700 sticky top-0 z-30 h-[60px] shadow-sm">
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
                  className="min-w-fit relative z-10" 
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