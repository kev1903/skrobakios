import React from 'react';
import { GripVertical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { createPortal } from 'react-dom';
import { WBSRowContextMenu } from './WBSRowContextMenu';

interface WBSItem {
  id: string;
  name: string;
  level: number;
  isExpanded?: boolean;
  hasChildren?: boolean;
  parent_id?: string;
  wbs_id?: string;
  text_formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    fontSize?: string;
  };
}

interface WBSLeftPanelProps {
  items: WBSItem[];
  onToggleExpanded: (itemId: string) => void;
  onDragEnd: (result: DropResult) => void;
  onDragUpdate?: (update: any) => void;
  onItemEdit: (itemId: string, field: string, value: string) => void;
  onAddChild?: (parentId: string) => void;
  onContextMenuAction?: (action: string, itemId: string, type: string) => void;
  dragIndicator: any;
  EditableCell: any;
  generateWBSNumber?: (phaseIndex: number, componentIndex?: number, elementIndex?: number) => string;
  scrollRef?: React.RefObject<HTMLDivElement>;
  onScroll?: () => void;
  hoveredId?: string | null;
  onRowHover?: (id: string | null) => void;
  selectedItems?: string[];
  onRowClick?: (itemId: string, ctrlKey?: boolean) => void;
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
  onDragUpdate,
  onItemEdit,
  onAddChild,
  onContextMenuAction,
  dragIndicator,
  EditableCell,
  generateWBSNumber,
  scrollRef,
  onScroll,
  hoveredId,
  onRowHover,
  selectedItems = [],
  onRowClick
}: WBSLeftPanelProps) => {
  
  // Helper function to determine if an item has children
  const hasChildren = (itemId: string) => {
    return items.some(item => item.parent_id === itemId);
  };
  
  // All items are always visible - no expand/collapse
  const visibleItems = items;
  
  const content = (
    <DragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
      <Droppable droppableId="wbs-items" type="item">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-full">
            {visibleItems.map((item, index) => {
              const itemHasChildren = hasChildren(item.id);
              const indentLevel = Math.min(item.level || 0, 4); // Clamp to max level 4
              const indentWidth = indentLevel * 16; // 16px per level, supporting up to 5 levels (0-4)
              
              // Calculate sequential WBS number based on display order (all items in the full list)
              const sequentialWBSNumber = items.findIndex(i => i.id === item.id) + 1;
              
              return (
                <div key={item.id} className="contents">
                  {dragIndicator && dragIndicator.type === 'item' && dragIndicator.index === index && (
                    <div className="px-2"><div className="h-0.5 bg-primary/60 rounded-full" /></div>
                  )}
                  
                  <Draggable draggableId={item.id} index={index}>
                    {(dragProvided, snapshot) => (
                      <DragPortalWrapper isDragging={snapshot.isDragging}>
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          data-row-id={item.id}
                          className={`grid items-center border-b border-gray-100 border-l-4 cursor-pointer transition-colors duration-150 ${
                            selectedItems.includes(item.id) 
                              ? 'bg-primary/10 border-l-primary' 
                              : hoveredId === item.id 
                                ? 'bg-gray-50 border-l-transparent' 
                                : 'bg-white hover:bg-gray-50 border-l-transparent'
                          } ${snapshot.isDragging ? 'bg-white shadow-lg border rounded-md' : ''}`}
                          style={{
                            gridTemplateColumns: '32px 70px 1fr 40px',
                            height: '28px',
                            width: snapshot.isDragging ? '580px' : 'auto',
                            ...dragProvided.draggableProps.style,
                          }}
                          onMouseEnter={() => onRowHover?.(item.id)}
                          onMouseLeave={() => onRowHover?.(null)}
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            // Ignore clicks on editable areas
                            if (target.closest('[data-field="name"]')) return;
                            onRowClick?.(item.id, e.ctrlKey || e.metaKey);
                          }}
                        >
                          {/* Drag Handle - NOT wrapped in context menu */}
                          <div className="px-2 flex items-center justify-center h-full">
                            <div
                              {...dragProvided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing p-1 rounded transition-colors duration-200 hover:bg-accent/20"
                              title="Drag to reorder"
                            >
                              <GripVertical className="w-3 h-3 text-muted-foreground" />
                            </div>
                          </div>

                          {/* Rest of row wrapped in context menu */}
                          <WBSRowContextMenu
                            itemId={item.id}
                            itemName={item.name}
                            hasChildren={itemHasChildren}
                            level={item.level || 0}
                            onAction={(action, itemId) => {
                              const itemType = item.level === 0 ? 'phase' : item.level === 1 ? 'component' : item.level === 2 ? 'element' : 'task';
                              onContextMenuAction?.(action, itemId, itemType);
                            }}
                          >
                            <div className="contents">
                              <div className="px-3 flex items-center h-full text-xs text-slate-600 font-medium">
                                {sequentialWBSNumber}
                              </div>
                              
                              <div 
                                className="px-3 flex items-center h-full font-medium text-foreground text-xs" 
                                style={{ paddingLeft: `${12 + indentWidth}px` }}
                              >
                                {/* No expand/collapse - all rows remain expanded */}
                                <div className="w-4 mr-2 flex-shrink-0" />
                                
                                <EditableCell
                                  id={item.id}
                                  type="task"
                                  field="name"
                                  value={item.name || ''}
                                  placeholder="Click to add activity"
                                  className="font-medium text-xs text-muted-foreground flex-1 cursor-text min-h-[20px] hover:bg-gray-50/50 rounded px-1 py-0.5 transition-colors"
                                  data-field="name"
                                  textFormatting={item.text_formatting}
                                />
                              </div>
                              
                              <div className="px-2 flex items-center justify-center h-full">
                                {itemHasChildren && onAddChild && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onAddChild(item.id);
                                    }}
                                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Add child item"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </WBSRowContextMenu>
                        </div>
                      </DragPortalWrapper>
                    )}
                  </Draggable>
                </div>
              );
            })}
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