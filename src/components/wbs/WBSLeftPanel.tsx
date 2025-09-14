import React from 'react';
import { ChevronRight, ChevronDown, GripVertical, Plus } from 'lucide-react';
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
  scrollRef: React.RefObject<HTMLDivElement>;
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
  return (
    <div className="w-[420px] h-full bg-white border-r border-border flex-shrink-0 overflow-hidden">
      {/* Content - No separate header since it's now unified */}
      <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide" onScroll={onScroll}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="wbs-phases" type="phase">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-full">
                {items.map((item, index) => (
                    <div key={item.id} className="contents">
                      {dragIndicator && dragIndicator.type === 'phase' && dragIndicator.index === index && (
                        <div className="px-2"><div className="h-0.5 bg-primary/60 rounded-full" /></div>
                      )}
                      
                      <Draggable draggableId={item.id} index={index}>
                        {(dragProvided, snapshot) => (
                          <DragPortalWrapper isDragging={snapshot.isDragging}>
                             <div
                               ref={dragProvided.innerRef}
                               {...dragProvided.draggableProps}
                 className={`grid items-center border-b border-gray-100 ${
                   item.level === 0 
                     ? 'bg-gradient-to-r from-slate-100 via-blue-50 to-slate-100 border-l-[6px] border-l-blue-800 shadow-sm hover:from-blue-50 hover:to-blue-100' 
                     : item.level === 1
                     ? 'bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 border-l-[4px] border-l-blue-400 hover:from-blue-100 hover:to-blue-200'
                     : 'bg-white border-l-2 border-l-slate-300 hover:bg-slate-50/50'
                 } cursor-pointer transition-all duration-200 ${
                   snapshot.isDragging ? 'shadow-lg bg-card z-30' : ''
                 } ${hoveredId === item.id ? 'bg-gradient-to-r from-gray-200/80 via-gray-100/60 to-gray-200/80 shadow-lg ring-2 ring-gray-300/50' : ''}`}
                               style={{
                                 gridTemplateColumns: '32px 120px 1fr 40px',
                                 height: '1.75rem',
                                 ...dragProvided.draggableProps.style,
                               }}
                              onClick={(e) => {
                                // Only expand/collapse if clicking outside the name field
                                const target = e.target as HTMLElement;
                                const isNameField = target.closest('[data-field="name"]');
                                if (!isNameField && item.hasChildren) {
                                  onToggleExpanded(item.id);
                                }
                              }}
                              onMouseEnter={() => onRowHover?.(item.id)}
                              onMouseLeave={() => onRowHover?.(null)}
                            >
                               <div className="px-2 flex items-center justify-center">
                                 <div className="flex items-center">
                                   <div
                                     {...dragProvided.dragHandleProps}
                                     className={`cursor-grab active:cursor-grabbing p-1 rounded transition-colors duration-200 mr-1 ${
                                       item.level === 1 ? 'ml-4' : item.level === 2 ? 'ml-8' : ''
                                     } ${
                                       snapshot.isDragging ? 'bg-accent/30 shadow-sm' : 'hover:bg-accent/20'
                                     }`}
                                     title="Drag to reorder"
                                   >
                                     <GripVertical className="w-3 h-3 text-muted-foreground" />
                                   </div>
                                    {item.hasChildren && (
                                      item.isExpanded ? (
                                        <ChevronDown className={`w-3 h-3 ${
                                          item.level === 0 ? 'text-gray-700' : 'text-gray-600'
                                        }`} />
                                      ) : (
                                        <ChevronRight className={`w-3 h-3 ${
                                          item.level === 0 ? 'text-gray-700' : 'text-gray-600'
                                        }`} />
                                     )
                                   )}
                                 </div>
                               </div>
                              
                                <div className={`px-2 flex items-center ${
                                  item.level === 1 ? 'ml-4' : item.level === 2 ? 'ml-12' : ''
                                } ${
                                  item.level === 0 
                                    ? 'font-black text-gray-800 text-sm tracking-wide' 
                                    : item.level === 1
                                    ? 'font-bold text-gray-700 text-sm'
                                    : 'font-medium text-gray-600 text-xs'
                                }`}>
                                {item.wbsNumber}
                              </div>
                              
                                <div className={`px-3 flex items-center ${
                                  item.level === 1 ? 'ml-4' : item.level === 2 ? 'ml-12' : ''
                                } ${
                                  item.level === 0 
                                    ? 'font-black text-gray-800 text-base tracking-wide' 
                                    : item.level === 1
                                    ? 'font-bold text-gray-700 text-sm'
                                    : 'font-medium text-foreground text-xs'
                                }`}>
                                <EditableCell
                                  id={item.id}
                                  type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
                                  field="name"
                                  value={item.name}
                                  placeholder={item.level === 2 ? "Untitled Element" : "Untitled"}
                                  className={item.level === 0 ? "font-black text-base text-gray-800 tracking-wide" : item.level === 1 ? "font-bold text-sm text-gray-700" : "font-medium text-xs text-muted-foreground"}
                                  data-field="name"
                                />
                              </div>
                              
                              {/* Add Child Button */}
                              <div className="px-2 flex items-center">
                                {item.level < 2 && onAddChild && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      onAddChild(item.id);
                                    }}
                                    className="h-6 w-6 p-0 hover:bg-primary/10"
                                    title={item.level === 0 ? "Add Component" : "Add Element"}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </DragPortalWrapper>
                        )}
                      </Draggable>
                    </div>
                ))}
                {dragIndicator && dragIndicator.type === 'phase' && dragIndicator.index === items.length && (
                  <div className="px-2"><div className="h-0.5 bg-primary/60 rounded-full" /></div>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};