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
}

// Portal wrapper to avoid transform/fixed offset issues during drag
const DragPortalWrapper = ({ isDragging, children }: { isDragging: boolean; children: React.ReactNode }) => {
  if (!isDragging) return <>{children}</>;
  if (typeof document === 'undefined') return <>{children}</>;
  return createPortal(children as any, document.body);
};

export const WBSLeftPanel = ({
  items,
  onToggleExpanded,
  onDragEnd,
  onItemEdit,
  dragIndicator,
  EditableCell,
  generateWBSNumber
}: WBSLeftPanelProps) => {
  return (
    <div className="w-[420px] bg-white border-r border-border flex-shrink-0 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-100/70 border-b border-slate-200 px-2 py-2 text-xs font-medium text-slate-700">
        <div className="grid items-center" style={{
          gridTemplateColumns: '32px 120px 1fr',
        }}>
          <div></div>
          <div className="px-2 font-semibold">WBS</div>
          <div className="px-3 font-semibold">NAME</div>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-200px)] overflow-y-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="wbs-phases" type="phase">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-full">
                {items.map((item, index) => (
                  <React.Fragment key={item.id}>
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
                            <div className="px-2 py-3 min-h-[3.5rem] flex items-center justify-center">
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
                            
                            <div className={`px-2 py-3 min-h-[3.5rem] flex items-center text-sm ${
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
                            
                            <div className={`px-3 py-3 min-h-[3.5rem] flex items-center ${
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
                  </React.Fragment>
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