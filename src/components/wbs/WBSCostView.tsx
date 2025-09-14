import React, { useRef, useCallback, useState } from 'react';
import { WBSLeftPanel } from './WBSLeftPanel';
import { WBSCostRightPanel } from './WBSCostRightPanel';
import { DropResult } from 'react-beautiful-dnd';

interface WBSItem {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
  assignedTo?: string;
  level: number;
  wbsNumber: string;
  isExpanded?: boolean;
  hasChildren?: boolean;
  start_date?: string | Date | null;
  end_date?: string | Date | null;
  duration?: number;
}

interface WBSCostViewProps {
  items: WBSItem[];
  onToggleExpanded: (itemId: string) => void;
  onDragEnd: (result: DropResult) => void;
  onItemUpdate: (itemId: string, updates: any) => void;
  onAddChild?: (parentId: string) => void;
  onContextMenuAction: (action: string, itemId: string, type: string) => void;
  onOpenNotesDialog: (item: any) => void;
  dragIndicator: any;
  EditableCell: any;
  StatusSelect: any;
  generateWBSNumber: (phaseIndex: number, componentIndex?: number, elementIndex?: number) => string;
}

export const WBSCostView = ({
  items,
  onToggleExpanded,
  onDragEnd,
  onItemUpdate,
  onAddChild,
  onContextMenuAction,
  onOpenNotesDialog,
  dragIndicator,
  EditableCell,
  StatusSelect,
  generateWBSNumber
}: WBSCostViewProps) => {
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
      <WBSLeftPanel
        items={items}
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
      
      <div className="flex-1 min-w-0 bg-white overflow-hidden">
        {/* Cost Table Header - matches data row structure exactly */}
        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
          <div
            className="grid items-center w-full text-xs font-medium text-gray-600"
            style={{
              gridTemplateColumns: '1fr 100px 100px 100px 100px 120px 100px 100px 200px',
              height: '1.75rem',
            }}
          >
            <div className="px-3 flex items-center h-full font-semibold">DESCRIPTION</div>
            <div className="px-2 flex items-center justify-end h-full font-semibold">BUDGET</div>
            <div className="px-2 flex items-center justify-end h-full font-semibold">COMMITTED</div>
            <div className="px-2 flex items-center justify-end h-full font-semibold">PAID</div>
            <div className="px-2 flex items-center justify-end h-full font-semibold">REMAINING</div>
            <div className="px-2 flex items-center justify-end h-full font-semibold">FORECAST FINAL</div>
            <div className="px-2 flex items-center justify-end h-full font-semibold">VARIANCE</div>
            <div className="px-2 flex items-center justify-center h-full font-semibold">STATUS</div>
            <div className="px-2 flex items-center h-full font-semibold">NOTES</div>
          </div>
        </div>
        
        <WBSCostRightPanel
          items={items}
          onItemUpdate={onItemUpdate}
          onContextMenuAction={onContextMenuAction}
          onOpenNotesDialog={onOpenNotesDialog}
          EditableCell={EditableCell}
          StatusSelect={StatusSelect}
          scrollRef={rightScrollRef}
          onScroll={handleRightScroll}
          hoveredId={hoveredId}
          onRowHover={setHoveredId}
        />
      </div>
    </div>
  );
};