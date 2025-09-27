import React, { useState, useRef, useCallback } from 'react';
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const costHeaderScrollRef = useRef<HTMLDivElement>(null);
  const costContentScrollRef = useRef<HTMLDivElement>(null);

  // Sync Cost section horizontal scrolling
  const handleCostContentScroll = useCallback(() => {
    if (costHeaderScrollRef.current && costContentScrollRef.current) {
      costHeaderScrollRef.current.scrollLeft = costContentScrollRef.current.scrollLeft;
    }
  }, []);

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Combined Header and Content Area - Scrollable Together */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <ResizablePanelGroup direction="horizontal" className="min-h-full">
          {/* Left Section - WBS Structure */}
          <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
            <div className="min-h-full border-r border-gray-200">
              {/* Left Header */}
              <div className="h-[60px] bg-slate-100/70 border-b border-slate-200 sticky top-0 z-30">
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
              <WBSLeftPanel
                items={items}
                onToggleExpanded={onToggleExpanded}
                onDragEnd={onDragEnd}
                onItemEdit={onItemUpdate}
                onAddChild={onAddChild}
                dragIndicator={dragIndicator}
                EditableCell={EditableCell}
                generateWBSNumber={generateWBSNumber}
                hoveredId={hoveredId}
                onRowHover={setHoveredId}
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* Right Section - Cost Data */}
          <ResizablePanel defaultSize={60} minSize={40} maxSize={75}>
            <div className="min-h-full overflow-hidden">
              {/* Right Header */}
              <div className="h-[60px] bg-slate-100/70 border-b border-slate-200 sticky top-0 z-30">
                <div 
                  ref={costHeaderScrollRef}
                  className="px-2 py-1 text-xs font-medium text-slate-700 h-full overflow-x-auto overflow-y-hidden scrollbar-hide"
                >
                  <div 
                    className="grid items-center h-full min-w-fit" 
                    style={{
                      gridTemplateColumns: '1fr 100px 100px 100px 100px 120px 100px 100px 200px',
                      width: '100%',
                      minWidth: '880px' // Ensure header has minimum width for all columns
                    }}
                  >
                    <div className="px-3 font-semibold">DESCRIPTION</div>
                    <div className="px-2 font-semibold text-right">BUDGET</div>
                    <div className="px-2 font-semibold text-right">COMMITTED</div>
                    <div className="px-2 font-semibold text-right">PAID</div>
                    <div className="px-2 font-semibold text-right">REMAINING</div>
                    <div className="px-2 font-semibold text-right">FORECAST FINAL</div>
                    <div className="px-2 font-semibold text-right">VARIANCE</div>
                    <div className="px-2 font-semibold text-right">STATUS</div>
                    <div className="px-2 font-semibold">NOTES</div>
                  </div>
                </div>
              </div>
              
              {/* Right Content */}
              <div 
                ref={costContentScrollRef}
                className="overflow-x-auto overflow-y-hidden"
                onScroll={handleCostContentScroll}
              >
                <WBSCostRightPanel
                  items={items}
                  onItemUpdate={onItemUpdate}
                  onContextMenuAction={onContextMenuAction}
                  onOpenNotesDialog={onOpenNotesDialog}
                  EditableCell={EditableCell}
                  StatusSelect={StatusSelect}
                  hoveredId={hoveredId}
                  onRowHover={setHoveredId}
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};