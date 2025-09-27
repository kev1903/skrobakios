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
  const unifiedScrollRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Fixed Headers */}
      <div className="h-8 bg-slate-100/70 border-b border-slate-200 sticky top-0 z-40">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Header - WBS Structure */}
          <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
            <div className="h-full border-r border-gray-200 bg-slate-100/70 text-xs font-medium text-slate-700">
              <div className="px-2 py-1 h-full">
                <div className="grid items-center h-full" style={{ gridTemplateColumns: '32px 120px 1fr 40px' }}>
                  <div></div>
                  <div className="px-2 font-semibold">WBS</div>
                  <div className="px-3 font-semibold">NAME</div>
                  <div></div>
                </div>
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* Right Header - Cost Data */}
          <ResizablePanel defaultSize={60} minSize={40} maxSize={75}>
            <div className="h-full bg-slate-100/70 text-xs font-medium text-slate-700">
              <div className="px-2 py-1 h-full">
                <div className="grid items-center h-full" style={{
                  gridTemplateColumns: '1fr 100px 100px 100px 100px 120px 100px 100px 200px',
                }}>
                  <div className="px-3 font-semibold">DESCRIPTION</div>
                  <div className="px-2 font-semibold text-right">BUDGET</div>
                  <div className="px-2 font-semibold text-right">COMMITTED</div>
                  <div className="px-2 font-semibold text-right">PAID</div>
                  <div className="px-2 font-semibold text-right">REMAINING</div>
                  <div className="px-2 font-semibold text-right">FORECAST FINAL</div>
                  <div className="px-2 font-semibold text-right">VARIANCE</div>
                  <div className="px-2 font-semibold text-center">STATUS</div>
                  <div className="px-2 font-semibold">NOTES</div>
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Unified Scrollable Content */}
      <div className="flex-1 overflow-hidden" style={{ height: 'calc(100% - 32px)' }}>
        <div 
          ref={unifiedScrollRef}
          className="h-full overflow-y-auto overflow-x-hidden"
          style={{ scrollbarWidth: 'auto' }}
        >
          <ResizablePanelGroup direction="horizontal" className="min-h-full">
            {/* Left Panel Content */}
            <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
              <div className="border-r border-gray-200 bg-white">
                <WBSLeftPanel
                  items={items}
                  onToggleExpanded={onToggleExpanded}
                  onDragEnd={onDragEnd}
                  onItemEdit={onItemUpdate}
                  onAddChild={onAddChild}
                  dragIndicator={dragIndicator}
                  EditableCell={EditableCell}
                  generateWBSNumber={generateWBSNumber}
                  scrollRef={unifiedScrollRef}
                  onScroll={() => {}}
                  hoveredId={hoveredId}
                  onRowHover={setHoveredId}
                />
              </div>
            </ResizablePanel>
            
            <ResizableHandle />
            
            {/* Right Panel Content */}
            <ResizablePanel defaultSize={60} minSize={40} maxSize={75}>
              <div className="bg-white">
                <WBSCostRightPanel
                  items={items}
                  onItemUpdate={onItemUpdate}
                  onContextMenuAction={onContextMenuAction}
                  onOpenNotesDialog={onOpenNotesDialog}
                  EditableCell={EditableCell}
                  StatusSelect={StatusSelect}
                  scrollRef={unifiedScrollRef}
                  onScroll={() => {}}
                  hoveredId={hoveredId}
                  onRowHover={setHoveredId}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
};