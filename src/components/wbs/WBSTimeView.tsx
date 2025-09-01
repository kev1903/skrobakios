import React, { useRef, useCallback } from 'react';
import { WBSLeftPanel } from './WBSLeftPanel';
import { WBSTimeRightPanel } from './WBSTimeRightPanel';
import { GanttChart } from './GanttChart';
import { DropResult } from 'react-beautiful-dnd';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

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
    <PanelGroup direction="horizontal" className="h-full w-full bg-white">
      {/* Left Panel - Table view */}
      <Panel defaultSize={50} minSize={30}>
        <div className="flex h-full w-full overflow-hidden">
          <div className="flex h-full w-full overflow-x-auto">
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
        </div>
      </Panel>

      {/* Resizable Handle */}
      <PanelResizeHandle className="w-2 bg-border hover:bg-accent transition-colors duration-200 cursor-col-resize flex items-center justify-center">
        <div className="w-1 h-8 bg-border rounded-full"></div>
      </PanelResizeHandle>

      {/* Right Panel - Gantt Chart (Header removed, now controlled by parent) */}
      <Panel defaultSize={50} minSize={30}>
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <GanttChart items={items} className="min-w-fit" />
        </div>
      </Panel>
    </PanelGroup>
  );
};