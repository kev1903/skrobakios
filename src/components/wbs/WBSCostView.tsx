import React, { useState } from 'react';
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

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Fixed Headers */}
      <div className="flex-shrink-0 bg-slate-100/70 border-b border-slate-200 sticky top-0 z-40">
        <ResizablePanelGroup direction="horizontal" className="h-8">
          {/* Left Header */}
          <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
            <div className="px-2 py-1 text-xs font-medium text-slate-700 h-full border-r border-gray-200">
              <div className="grid items-center h-full" style={{
                gridTemplateColumns: '32px 120px 1fr 40px',
              }}>
                <div></div>
                <div className="px-2 font-semibold">WBS</div>
                <div className="px-3 font-semibold">NAME</div>
                <div></div>
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* Right Header */}
          <ResizablePanel defaultSize={60} minSize={40} maxSize={75}>
            <div className="px-2 py-1 text-xs font-medium text-slate-700 h-full">
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
                <div className="px-2 font-semibold text-right">STATUS</div>
                <div className="px-2 font-semibold">NOTES</div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Unified Content Area with Single Scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-thin">
        <ResizablePanelGroup direction="horizontal" className="min-h-full">
          {/* Left Content */}
          <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
            <div className="min-h-full border-r border-gray-200">
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
          
          {/* Right Content */}
          <ResizablePanel defaultSize={60} minSize={40} maxSize={75}>
            <div className="min-h-full">
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
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};