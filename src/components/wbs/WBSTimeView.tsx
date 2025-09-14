import React, { useRef, useCallback, useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, startOfWeek, endOfWeek, addDays, parseISO, isSameDay } from 'date-fns';
import { UnifiedWBSRow } from './UnifiedWBSRow';
import { DropResult, DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { WBSItem } from '@/types/wbs';
import { createPortal } from 'react-dom';

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

// Portal wrapper to avoid transform/fixed offset issues during drag
const DragPortalWrapper = ({ isDragging, children }: { isDragging: boolean; children: React.ReactNode }) => {
  if (!isDragging || typeof document === 'undefined') {
    return <div className="contents">{children}</div>;
  }
  return createPortal(children as any, document.body);
};

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Calculate timeline data for unified rows
  const timelineData = useMemo(() => {
    const itemsWithDates = items.filter(item => item.start_date || item.end_date);
    let days: Date[] = [];
    
    if (itemsWithDates.length > 0) {
      const dates = itemsWithDates
        .flatMap(item => [
          item.start_date ? (typeof item.start_date === 'string' ? parseISO(item.start_date) : item.start_date) : null,
          item.end_date ? (typeof item.end_date === 'string' ? parseISO(item.end_date) : item.end_date) : null
        ])
        .filter(Boolean) as Date[];
      
      if (dates.length > 0) {
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
        const chartStart = startOfWeek(minDate);
        const chartEnd = endOfWeek(addDays(maxDate, 14));
        days = eachDayOfInterval({ start: chartStart, end: chartEnd });
        return { days, chartStart };
      }
    }
    
    // Fallback to current month if no dates
    const currentDate = new Date();
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    return { days, chartStart: monthStart };
  }, [items]);

  // Simplified item update handler
  const handleItemUpdate = useCallback(async (itemId: string, updates: any) => {
    await onItemUpdate(itemId, updates);
  }, [onItemUpdate]);

  const dayWidth = 32;
  
  return (
    <div className="h-full w-full bg-white flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0 h-[60px] flex shadow-sm z-10">
        {/* Left Header - WBS Columns */}
        <div className="w-[420px] px-2 py-1 text-xs font-medium text-gray-700 border-r border-gray-200 flex-shrink-0 bg-white">
          <div className="grid items-center h-full" style={{ gridTemplateColumns: '32px 120px 1fr 40px' }}>
            <div></div>
            <div className="px-2 font-semibold">WBS</div>
            <div className="px-3 font-semibold">NAME</div>
            <div></div>
          </div>
        </div>
        
        {/* Middle Header - Detail Columns */}
        <div className="flex-shrink-0" style={{ width: '920px' }}>
          <div className="py-1 text-xs font-medium text-gray-700 flex items-center h-full">
            <div className="grid items-center w-full" style={{
              gridTemplateColumns: 'minmax(200px, 1fr) 120px 120px 100px 140px 140px 120px'
            }}>
              <div className="px-3 font-semibold">DESCRIPTION</div>
              <div className="px-2 font-semibold">START DATE</div>
              <div className="px-2 font-semibold">END DATE</div>
              <div className="px-2 font-semibold">DURATION</div>
              <div className="px-2 font-semibold">PREDECESSORS</div>
              <div className="px-2 font-semibold">STATUS</div>
              <div className="px-2 font-semibold">ACTIONS</div>
            </div>
          </div>
        </div>

        {/* Right Header - Timeline Days */}
        <div className="flex-1 border-l border-gray-200 overflow-x-auto" style={{ minWidth: timelineData.days.length * dayWidth }}>
          <div className="flex h-full" style={{ width: timelineData.days.length * dayWidth }}>
            {timelineData.days.map((day, index) => {
              const isToday = isSameDay(day, new Date());
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
            })}
          </div>
        </div>

        {/* Clear Dates Button */}
        {onClearAllDates && (
          <div className="px-2 flex items-center">
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

      {/* Scrollable Content */}
      <div ref={containerRef} className="flex-1 overflow-y-auto overflow-x-auto">
        <div style={{ minWidth: 420 + 920 + (timelineData.days.length * dayWidth) }}>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="unified-wbs-rows" type="phase">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-full">
                  {items.map((item, index) => (
                    <div key={item.id} className="contents">
                      {dragIndicator && dragIndicator.type === 'phase' && dragIndicator.index === index && (
                        <div className="px-2"><div className="h-0.5 bg-primary/60 rounded-full" /></div>
                      )}
                      
                      <Draggable draggableId={item.id} index={index}>
                        {(dragProvided, snapshot) => (
                          <DragPortalWrapper isDragging={snapshot.isDragging}>
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              className={snapshot.isDragging ? 'shadow-lg bg-card z-50' : ''}
                            >
                              <UnifiedWBSRow
                                key={item.id}
                                item={item}
                                isHovered={hoveredId === item.id}
                                onToggleExpanded={onToggleExpanded}
                                onItemUpdate={handleItemUpdate}
                                onAddChild={onAddChild}
                                onContextMenuAction={onContextMenuAction}
                                onOpenNotesDialog={onOpenNotesDialog}
                                onRowHover={setHoveredId}
                                dragHandleProps={dragProvided.dragHandleProps}
                                EditableCell={EditableCell}
                                StatusSelect={StatusSelect}
                                timelineDays={timelineData.days}
                                chartStart={timelineData.chartStart}
                                dayWidth={dayWidth}
                                availableItems={items}
                              />
                            </div>
                          </DragPortalWrapper>
                        )}
                      </Draggable>
                    </div>
                  ))}
                  {dragIndicator && dragIndicator.type === 'phase' && dragIndicator.index === items.length && (
                    <div className="px-2"><div className="h-0.5 bg-primary/60 rounded-full" /></div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};