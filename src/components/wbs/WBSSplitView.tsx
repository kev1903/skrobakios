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
    <div className="h-full w-full bg-white">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
          <div className="h-full flex flex-col">
            {/* Left Header */}
            <div className="h-8 bg-slate-100/70 border-b border-slate-200 border-r border-gray-200">
              <div className="px-2 py-1 text-xs font-medium text-slate-700 h-full">
                <div className="grid items-center h-full" style={{
                  gridTemplateColumns: '32px 120px 1fr 40px',
                }}>
                  <div></div>
                  <div className="px-2 font-semibold">WBS</div>
                  <div className="px-3 font-semibold">NAME</div>
                  <div></div>
                </div>
              </div>
            </div>
            
            {/* Left Content */}
            <div className="flex-1">
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
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle />
        
        <ResizablePanel defaultSize={60} minSize={40} maxSize={75}>
          <div className="h-full flex flex-col">
            {/* Right Header */}
            <div className="h-8 bg-slate-100/70 border-b border-slate-200">
              <div className="px-2 py-1 text-xs font-medium text-slate-700 h-full">
                <div className="grid items-center h-full" style={{
                  gridTemplateColumns: '140px 120px 160px 40px 84px',
                }}>
                  <div className="px-2 font-semibold flex items-center justify-start h-full">STATUS</div>
                  <div className="px-2 font-semibold flex items-center justify-start h-full">PROGRESS</div>
                  <div className="px-2 font-semibold flex items-center justify-start h-full">ASSIGNED TO</div>
                  <div className="px-1 font-semibold flex items-center justify-center h-full">NOTE</div>
                  <div className="px-2 font-semibold flex items-center justify-center h-full">ACTIONS</div>
                </div>
              </div>
            </div>
            
            {/* Right Content */}
            <div className="flex-1">
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
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};