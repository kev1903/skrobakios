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

  const handleLeftScroll = useCallback(() => {
    if (leftScrollRef.current && rightScrollRef.current) {
      rightScrollRef.current.scrollTop = leftScrollRef.current.scrollTop;
    }
  }, []);

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <PanelGroup direction="horizontal" className="h-full w-full flex flex-col">
        {/* Left Panel - includes both header and content */}
        <Panel defaultSize={50} minSize={30} className="flex flex-col">
          {/* Header Section */}
          <div className="bg-slate-100/70 border-t border-slate-200 border-b border-border flex-shrink-0">
            <div className="flex h-full">
              {/* WBS Left Panel Header */}
              <div className="w-[420px] px-2 py-2 text-xs font-medium text-slate-700 border-r border-border">
                <div className="grid items-center" style={{
                  gridTemplateColumns: '32px 120px 1fr',
                }}>
                  <div></div>
                  <div className="px-2 font-semibold">WBS</div>
                  <div className="px-3 font-semibold">NAME</div>
                </div>
              </div>
              
              {/* WBS Right Panel Header - Table Section */}
              <div className="flex-1 px-2 py-2 text-xs font-medium text-slate-700">
                <div className="grid items-center" style={{
                  gridTemplateColumns: '1fr 120px 120px 100px 140px 140px 84px',
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
          </div>

          {/* Content Section */}
          <div className="flex-1 min-h-0 flex overflow-hidden">
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
                onScroll={handleLeftScroll}
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

        {/* Single Resizable Handle */}
        <PanelResizeHandle className="w-2 bg-border hover:bg-accent transition-colors duration-200 cursor-col-resize flex items-center justify-center">
          <div className="w-1 h-8 bg-border rounded-full"></div>
        </PanelResizeHandle>

        {/* Right Panel - includes both header and Gantt chart */}
        <Panel defaultSize={50} minSize={30} className="flex flex-col">
          {/* Header Section */}
          <div className="bg-slate-100/70 border-t border-slate-200 border-b border-border border-l border-border px-2 py-2 text-xs font-medium text-slate-700 flex-shrink-0">
            <div className="px-3 font-semibold">TIMELINE</div>
          </div>

          {/* Gantt Chart Content */}
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <GanttChart items={items} className="min-w-fit" hideHeader />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};