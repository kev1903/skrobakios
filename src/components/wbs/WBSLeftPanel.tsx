import React from 'react';
import { ChevronRight, ChevronDown, GripVertical, Plus, PlusCircle, PlusSquare, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { createPortal } from 'react-dom';

interface WBSItem {
  id: string;
  name: string;
  level: number;
  isExpanded?: boolean;
  hasChildren?: boolean;
  parent_id?: string;
  wbs_id?: string;
}

interface WBSLeftPanelProps {
  items: WBSItem[];
  onToggleExpanded: (itemId: string) => void;
  onDragEnd: (result: DropResult) => void;
  onDragUpdate?: (update: any) => void;
  onItemEdit: (itemId: string, field: string, value: string) => void;
  onAddChild?: (parentId: string) => void;
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
  
  // Helper function to determine if an item should be visible (not hidden by collapsed parent)
  const isItemVisible = (item: WBSItem) => {
    if (item.level === 0) return true; // Top level items are always visible
    
    // Find the parent item
    const parent = items.find(i => i.id === item.parent_id);
    if (!parent) return true;
    
    // If parent is collapsed, this item should be hidden
    if (parent.isExpanded === false) return false;
    
    // Recursively check if all ancestors are expanded
    return isItemVisible(parent);
  };
  
// Remove debug logs from WBSLeftPanel after testing
  // Filter items to only show visible ones
  const visibleItems = items.filter(isItemVisible);
  
  const content = (
    <DragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
      <Droppable droppableId="wbs-items" type="item">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-full">
            {visibleItems.map((item, index) => {
              const itemHasChildren = hasChildren(item.id);
              const indentLevel = Math.min(item.level || 0, 4); // Clamp to max level 4
              const indentWidth = indentLevel * 16; // 16px per level, supporting up to 5 levels (0-4)
              const isExpanded = item.isExpanded !== false; // Default to true if not specified
              
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
                            // Ignore clicks on chevron or editable areas
                            if (target.closest('[data-field="name"]')) return;
                            if (target.closest('[title*="children"]')) return;
                            onRowClick?.(item.id, e.ctrlKey || e.metaKey);
                          }}
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

                        <div className="px-3 flex items-center h-full text-xs text-slate-600 font-medium">
                          {sequentialWBSNumber}
                        </div>
                        
                        <div 
                          className="px-3 flex items-center h-full font-medium text-foreground text-xs" 
                          style={{ paddingLeft: `${12 + indentWidth}px` }}
                        >
                          {/* Always show chevron for items with children, regardless of expand/collapse state */}
                          {itemHasChildren ? (
                            <div
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onToggleExpanded(item.id);
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              style={{ pointerEvents: 'auto' }}
                              className="mr-2 p-1 rounded hover:bg-accent/20 transition-colors flex-shrink-0 cursor-pointer z-50 relative"
                              title={isExpanded ? "Collapse children" : "Expand children"}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3 h-3 text-muted-foreground pointer-events-none" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-muted-foreground pointer-events-none" />
                              )}
                            </div>
                          ) : (
                            <div className="w-4 mr-2 flex-shrink-0" />
                          )}
                          
                          <EditableCell
                            id={item.id}
                            type="task"
                            field="name"
                            value={item.name || ''}
                            placeholder="Click to add activity"
                            className="font-medium text-xs text-muted-foreground flex-1 cursor-text min-h-[20px] hover:bg-gray-50/50 rounded px-1 py-0.5 transition-colors"
                            data-field="name"
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