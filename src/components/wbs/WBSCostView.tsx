import React, { useRef, useCallback, useState } from 'react';
import { WBSLeftPanel } from './WBSLeftPanel';
import { WBSCostRightPanel } from './WBSCostRightPanel';
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
    <div className="h-full w-full bg-white">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        {/* Left Panel - WBS Structure */}
        <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
          <div className="h-full flex flex-col">
            {/* WBS Header */}
            <div className="h-[60px] bg-gray-50 border-b-2 border-gray-300 text-xs font-bold text-gray-700 sticky top-0 z-30 shadow-sm">
              <div className="h-full grid items-center" style={{ gridTemplateColumns: '32px 120px 1fr 40px' }}>
                <div className="px-2 text-center"></div>
                <div className="px-2">WBS</div>
                <div className="px-3">NAME</div>
                <div></div>
              </div>
            </div>
            
            {/* WBS Content */}
            <div className="flex-1 overflow-hidden">
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
        
        {/* Right Panel - Cost Data */}
        <ResizablePanel defaultSize={60} minSize={40} maxSize={75}>
          <div className="h-full flex flex-col">
            {/* Cost Header */}
            <div className="h-[60px] bg-gray-50 border-b-2 border-gray-300 text-xs font-bold text-gray-700 sticky top-0 z-30 shadow-sm">
              <div className="h-full grid items-center" style={{
                gridTemplateColumns: '1fr 100px 100px 100px 100px 120px 100px 100px 200px',
              }}>
                <div className="px-3 text-center">DESCRIPTION</div>
                <div className="px-2 text-center">BUDGET</div>
                <div className="px-2 text-center">COMMITTED</div>
                <div className="px-2 text-center">PAID</div>
                <div className="px-2 text-center">REMAINING</div>
                <div className="px-2 text-center">FORECAST FINAL</div>
                <div className="px-2 text-center">VARIANCE</div>
                <div className="px-2 text-center">STATUS</div>
                <div className="px-2 text-center">NOTES</div>
              </div>
            </div>
            
            {/* Cost Content */}
            <div className="flex-1 overflow-hidden">
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
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};