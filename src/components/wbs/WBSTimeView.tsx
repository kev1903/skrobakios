import React, { useRef, useCallback } from 'react';
import { WBSLeftPanel } from './WBSLeftPanel';
import { WBSTimeRightPanel } from './WBSTimeRightPanel';
import { GanttChart } from './GanttChart';
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
      {/* Left side - Table view with horizontal scroll */}
      <div className="flex-1 flex h-full overflow-hidden">
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

      {/* Right side - Gantt Chart with horizontal scroll */}
      <div className="w-1/2 flex flex-col overflow-hidden">
        <div className="bg-slate-100/70 border-b border-slate-200 px-2 py-2 text-xs font-medium text-slate-700 border-l border-border flex-shrink-0">
          <div className="px-3 font-semibold">TIMELINE</div>
        </div>
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <GanttChart items={items} className="min-w-fit" />
        </div>
      </div>
    </div>
  );
};