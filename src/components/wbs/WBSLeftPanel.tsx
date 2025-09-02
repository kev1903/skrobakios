import React from 'react';
import { ChevronRight, ChevronDown, GripVertical } from 'lucide-react';
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
  dragIndicator: any;
  EditableCell: any;
  generateWBSNumber: (phaseIndex: number, componentIndex?: number, elementIndex?: number) => string;
  scrollRef: React.RefObject<HTMLDivElement>;
  onScroll?: () => void;
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
  dragIndicator,
  EditableCell,
  generateWBSNumber,
  scrollRef,
  onScroll
}: WBSLeftPanelProps) => {
  return (
    <div className="w-[420px] bg-white border-r border-border flex-shrink-0 overflow-hidden">
      {/* Content - No separate header since it's now unified */}
      <div ref={scrollRef} className="h-full overflow-hidden" onScroll={onScroll}>
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
                              className={`grid items-center ${
                                item.level === 0 
                                  ? 'bg-primary/5 border-l-4 border-l-primary hover:bg-primary/10' 
                                  : item.level === 1
                                  ? 'bg-secondary/5 border-l-4 border-l-secondary hover:bg-secondary/10'
                                  : 'bg-white border-l-2 border-l-slate-300 hover:bg-slate-50/50'
                              } cursor-pointer transition-colors duration-200 ${
                                snapshot.isDragging ? 'shadow-lg bg-card z-30' : ''
                              }`}
                              style={{
                                gridTemplateColumns: '32px 120px 1fr',
                                ...dragProvided.draggableProps.style,
                              }}
                              onClick={() => item.hasChildren && onToggleExpanded(item.id)}
                            >
                              <div className="px-2 py-1 min-h-[2rem] flex items-center justify-center">
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
                                        item.level === 0 ? 'text-primary' : 'text-secondary-foreground'
                                      }`} />
                                    ) : (
                                      <ChevronRight className={`w-3 h-3 ${
                                        item.level === 0 ? 'text-primary' : 'text-secondary-foreground'
                                      }`} />
                                    )
                                  )}
                                </div>
                              </div>
                              
                              <div className={`px-2 py-1 min-h-[2rem] flex items-center text-sm ${
                                item.level === 1 ? 'ml-4' : item.level === 2 ? 'ml-12' : ''
                              } ${
                                item.level === 0 
                                  ? 'font-bold text-primary' 
                                  : item.level === 1
                                  ? 'font-semibold text-secondary-foreground text-xs'
                                  : 'font-medium text-slate-600 text-xs'
                              }`}>
                                {item.wbsNumber}
                              </div>
                              
                              <div className={`px-3 py-1 min-h-[2rem] flex items-center ${
                                item.level === 1 ? 'ml-4' : item.level === 2 ? 'ml-12' : ''
                              } ${
                                item.level === 0 
                                  ? 'font-bold text-primary text-sm' 
                                  : item.level === 1
                                  ? 'font-semibold text-secondary-foreground text-xs'
                                  : 'font-medium text-foreground text-xs'
                              }`}>
                                <EditableCell
                                  id={item.id}
                                  type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
                                  field="name"
                                  value={item.name}
                                  placeholder={item.level === 2 ? "Untitled Element" : "Untitled"}
                                  className={item.level === 0 ? "font-bold text-sm text-primary" : item.level === 1 ? "font-semibold text-xs text-secondary-foreground" : "font-medium text-xs text-muted-foreground"}
                                />
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