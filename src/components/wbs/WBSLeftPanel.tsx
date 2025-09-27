import React from 'react';
import { ChevronRight, ChevronDown, GripVertical, Plus, PlusCircle, PlusSquare, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { createPortal } from 'react-dom';

interface WBSItem {
  id: string;
  name: string;
  wbsNumber: string;
  level: number;
  isExpanded?: boolean;
  hasChildren?: boolean;
}

interface WBSLeftPanelProps {
  items: WBSItem[];
  onToggleExpanded: (itemId: string) => void;
  onDragEnd: (result: DropResult) => void;
  onItemEdit: (itemId: string, field: string, value: string) => void;
  onAddChild?: (parentId: string) => void;
  dragIndicator: any;
  EditableCell: any;
  generateWBSNumber: (phaseIndex: number, componentIndex?: number, elementIndex?: number) => string;
  scrollRef?: React.RefObject<HTMLDivElement>;
  onScroll?: () => void;
  hoveredId?: string | null;
  onRowHover?: (id: string | null) => void;
}

// Portal wrapper to avoid transform/fixed offset issues during drag
const DragPortalWrapper = ({ isDragging, children }: { isDragging: boolean; children: React.ReactNode }) => {
  if (!isDragging || typeof document === 'undefined') {
    return <div className="contents">{children}</div>;
  }
  return createPortal(children as any, document.body);
};

export const WBSLeftPanel = ({
  items,
  onToggleExpanded,
  onDragEnd,
  onItemEdit,
  onAddChild,
  dragIndicator,
  EditableCell,
  generateWBSNumber,
  scrollRef,
  onScroll,
  hoveredId,
  onRowHover
}: WBSLeftPanelProps) => {
  
  const content = (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="wbs-items" type="item">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-full">
            {items.map((item, index) => (
              <div key={item.id} className="contents">
                {dragIndicator && dragIndicator.type === 'item' && dragIndicator.index === index && (
                  <div className="px-2"><div className="h-0.5 bg-primary/60 rounded-full" /></div>
                )}
                
                <Draggable draggableId={item.id} index={index}>
                  {(dragProvided, snapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className={`grid items-center border-b border-gray-100 bg-white hover:bg-slate-50/50 cursor-pointer transition-all duration-200 ${
                        snapshot.isDragging ? 'shadow-lg bg-card z-30' : ''
                      } ${hoveredId === item.id ? 'bg-gradient-to-r from-gray-200/80 via-gray-100/60 to-gray-200/80 shadow-lg ring-2 ring-gray-300/50' : ''}`}
                      style={{
                        gridTemplateColumns: '32px 120px 1fr 40px',
                        height: '28px',
                        ...dragProvided.draggableProps.style,
                      }}
                      onMouseEnter={() => onRowHover?.(item.id)}
                      onMouseLeave={() => onRowHover?.(null)}
                    >
                      <div className="px-2 flex items-center justify-center h-full">
                        <div
                          {...dragProvided.dragHandleProps}
                          className="cursor-grab active:cursor-grabbing p-1 rounded transition-colors duration-200 hover:bg-accent/20"
                          title="Drag to reorder"
                        >
                          <GripVertical className="w-3 h-3 text-muted-foreground" />
                        </div>
                      </div>
                      
                      <div className="px-2 flex items-center h-full font-medium text-gray-600 text-xs">
                        {item.wbsNumber}
                      </div>
                      
                      <div className="px-3 flex items-center h-full font-medium text-foreground text-xs">
                        <EditableCell
                          id={item.id}
                          type="task"
                          field="name"
                          value={item.name}
                          placeholder="Untitled Task"
                          className="font-medium text-xs text-muted-foreground"
                          data-field="name"
                        />
                      </div>
                      
                      <div className="px-2 flex items-center justify-center h-full">
                        {/* No add child button needed in flat structure */}
                      </div>
                    </div>
                  )}
                </Draggable>
              </div>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );

  return (
    <div className="bg-white flex-shrink-0">
      {content}
    </div>
  );
};