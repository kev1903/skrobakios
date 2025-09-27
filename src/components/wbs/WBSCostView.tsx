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
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleScroll = useCallback(() => {
    // Single scroll handler for the main container
  }, []);

  console.log("WBSCostView rendering with items:", items.length);
  
  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Headers */}
      <div className="flex border-b border-slate-200">
        <div className="w-2/5 h-8 bg-slate-100/70 border-r border-gray-200">
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
        
        <div className="w-3/5 h-8 bg-slate-100/70">
          <div className="px-2 py-1 text-xs font-medium text-slate-700 h-full">
            <div className="grid items-center h-full" style={{
              gridTemplateColumns: '2fr 60px 60px 60px 60px 80px 60px 60px 1fr',
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
      </div>
      
      {/* Content with single scroll */}
      <div 
        ref={mainScrollRef} 
        className="flex-1 overflow-y-auto overflow-x-hidden"
        onScroll={handleScroll}
      >
        <div className="flex">
          <div className="w-2/5 border-r border-gray-200">
            <WBSLeftPanel
              items={items}
              onToggleExpanded={onToggleExpanded}
              onDragEnd={onDragEnd}
              onItemEdit={onItemUpdate}
              onAddChild={onAddChild}
              dragIndicator={dragIndicator}
              EditableCell={EditableCell}
              generateWBSNumber={generateWBSNumber}
              scrollRef={null}
              onScroll={() => {}}
              hoveredId={hoveredId}
              onRowHover={setHoveredId}
            />
          </div>
          
          <div className="w-3/5">
            <WBSCostRightPanel
              items={items}
              onItemUpdate={onItemUpdate}
              onContextMenuAction={onContextMenuAction}
              onOpenNotesDialog={onOpenNotesDialog}
              EditableCell={EditableCell}
              StatusSelect={StatusSelect}
              scrollRef={null}
              onScroll={() => {}}
              hoveredId={hoveredId}
              onRowHover={setHoveredId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};