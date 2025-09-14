import React, { useRef, useCallback, useState } from 'react';
import { WBSLeftPanel } from './WBSLeftPanel';
import { WBSTimeRightPanel } from './WBSTimeRightPanel';
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Use EXACT same scroll synchronization as SCOPE tab
  const handleRightScroll = useCallback(() => {
    if (leftScrollRef.current && rightScrollRef.current) {
      leftScrollRef.current.scrollTop = rightScrollRef.current.scrollTop;
    }
  }, []);

  const handleLeftScroll = useCallback(() => {
    if (leftScrollRef.current && rightScrollRef.current) {
      rightScrollRef.current.scrollTop = leftScrollRef.current.scrollTop;
    }
  }, []);

  return (
    <div className="flex h-full w-full bg-white overflow-hidden">
      {/* Use EXACT same WBSLeftPanel as SCOPE tab */}
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
        onScroll={handleLeftScroll}
        hoveredId={hoveredId}
        onRowHover={setHoveredId}
      />
      
      {/* Use EXACT same structure as WBSCostRightPanel for alignment */}
      <WBSTimeRightPanel
        items={items}
        onItemUpdate={onItemUpdate}
        onContextMenuAction={onContextMenuAction}
        onOpenNotesDialog={onOpenNotesDialog}
        onClearAllDates={onClearAllDates}
        EditableCell={EditableCell}
        StatusSelect={StatusSelect}
        scrollRef={rightScrollRef}
        onScroll={handleRightScroll}
        hoveredId={hoveredId}
        onRowHover={setHoveredId}
      />
    </div>
  );
};