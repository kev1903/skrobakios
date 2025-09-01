import React, { useRef, useCallback } from 'react';
import { WBSLeftPanel } from './WBSLeftPanel';
import { WBSTimeRightPanel } from './WBSTimeRightPanel';
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
}

interface WBSTimeViewProps {
  items: WBSItem[];
  onToggleExpanded: (itemId: string) => void;
  onDragEnd: (result: DropResult) => void;
  onItemUpdate: (itemId: string, updates: any) => void;
  onContextMenuAction: (action: string, itemId: string, type: string) => void;
  onOpenNotesDialog: (item: any) => void;
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
  onContextMenuAction,
  onOpenNotesDialog,
  dragIndicator,
  EditableCell,
  StatusSelect,
  generateWBSNumber
}: WBSTimeViewProps) => {
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  const handleRightScroll = useCallback(() => {
    if (leftScrollRef.current && rightScrollRef.current) {
      leftScrollRef.current.scrollTop = rightScrollRef.current.scrollTop;
    }
  }, []);

  return (
    <div className="flex h-full w-full bg-white overflow-hidden">
      <WBSLeftPanel
        items={items}
        onToggleExpanded={onToggleExpanded}
        onDragEnd={onDragEnd}
        onItemEdit={onItemUpdate}
        dragIndicator={dragIndicator}
        EditableCell={EditableCell}
        generateWBSNumber={generateWBSNumber}
        scrollRef={leftScrollRef}
      />
      
      <WBSTimeRightPanel
        items={items}
        onItemUpdate={onItemUpdate}
        onContextMenuAction={onContextMenuAction}
        onOpenNotesDialog={onOpenNotesDialog}
        EditableCell={EditableCell}
        StatusSelect={StatusSelect}
        scrollRef={rightScrollRef}
        onScroll={handleRightScroll}
      />
    </div>
  );
};