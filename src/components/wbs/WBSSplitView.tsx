import React, { useRef, useCallback, useState } from 'react';
import { WBSLeftPanel } from './WBSLeftPanel';
import { WBSRightPanel } from './WBSRightPanel';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
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
  onAddChild?: (parentId: string) => void;
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
  onAddChild,
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
    <ResizablePanelGroup direction="horizontal" className="h-full w-full bg-white">
      <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
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
      </ResizablePanel>
      
      <ResizableHandle />
      
      <ResizablePanel defaultSize={60} minSize={40} maxSize={75}>
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
          hoveredId={hoveredId}
          onRowHover={setHoveredId}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};