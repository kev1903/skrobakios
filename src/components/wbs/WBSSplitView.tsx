import React, { useRef, useCallback } from 'react';
import { WBSLeftPanel } from './WBSLeftPanel';
import { WBSRightPanel } from './WBSRightPanel';
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

interface WBSSplitViewProps {
  items: WBSItem[];
  onToggleExpanded: (itemId: string) => void;
  onDragEnd: (result: DropResult) => void;
  onItemUpdate: (itemId: string, updates: any) => void;
  onContextMenuAction: (action: string, itemId: string, type: string) => void;
  onOpenNotesDialog: (item: any) => void;
  dragIndicator: any;
  EditableCell: any;
  StatusSelect: any;
  ProgressInput: any;
  ProgressDisplay: any;
  getProgressColor: (progress: number) => string;
  generateWBSNumber: (phaseIndex: number, componentIndex?: number, elementIndex?: number) => string;
}

export const WBSSplitView = ({
  items,
  onToggleExpanded,
  onDragEnd,
  onItemUpdate,
  onContextMenuAction,
  onOpenNotesDialog,
  dragIndicator,
  EditableCell,
  StatusSelect,
  ProgressInput,
  ProgressDisplay,
  getProgressColor,
  generateWBSNumber
}: WBSSplitViewProps) => {
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  const handleRightScroll = useCallback(() => {
    if (leftScrollRef.current && rightScrollRef.current) {
      leftScrollRef.current.scrollTop = rightScrollRef.current.scrollTop;
    }
  }, []);

  return (
    <div className="flex h-full bg-white rounded-lg border border-border shadow-sm overflow-hidden">
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
      
      <WBSRightPanel
        items={items}
        onItemUpdate={onItemUpdate}
        onContextMenuAction={onContextMenuAction}
        onOpenNotesDialog={onOpenNotesDialog}
        EditableCell={EditableCell}
        StatusSelect={StatusSelect}
        ProgressInput={ProgressInput}
        ProgressDisplay={ProgressDisplay}
        getProgressColor={getProgressColor}
        scrollRef={rightScrollRef}
        onScroll={handleRightScroll}
      />
    </div>
  );
};