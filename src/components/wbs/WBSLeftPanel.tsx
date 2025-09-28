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
}

interface WBSLeftPanelProps {
  items: WBSItem[];
  onToggleExpanded: (itemId: string) => void;
  onDragEnd: (result: DropResult) => void;
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
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="wbs-items" type="item">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-full">
            {visibleItems.map((item, index) => {
              const itemHasChildren = hasChildren(item.id);
              const indentLevel = Math.min(item.level || 0, 4); // Clamp to max level 4
              const indentWidth = indentLevel * 16; // 16px per level, supporting up to 5 levels (0-4)
              const isExpanded = item.isExpanded !== false; // Default to true if not specified
              
              // Debug logging for chevron visibility
              console.log(`🔍 Item ${item.id} (${item.name}) - Level: ${item.level}, HasChildren: ${itemHasChildren}, IsExpanded: ${isExpanded}`);
              
              return (
                <div key={item.id} className="contents">
                  {dragIndicator && dragIndicator.type === 'item' && dragIndicator.index === index && (
                    <div className="px-2"><div className="h-0.5 bg-primary/60 rounded-full" /></div>
                  )}
                  
                  <Draggable draggableId={item.id} index={index}>
                    {(dragProvided, snapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        className={`grid items-center border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                          selectedItems.includes(item.id) 
                            ? 'bg-primary/10 border-l-4 border-l-primary' 
                            : hoveredId === item.id 
                              ? 'bg-gradient-to-r from-gray-200/80 via-gray-100/60 to-gray-200/80 ring-2 ring-gray-300/50' 
                              : 'bg-white hover:bg-slate-50/50'
                        } ${snapshot.isDragging ? 'bg-card z-30' : ''}`}
                        style={{
                          gridTemplateColumns: '32px 1fr 40px',
                          height: '28px',
                          ...dragProvided.draggableProps.style,
                        }}
                        onMouseEnter={() => onRowHover?.(item.id)}
                        onMouseLeave={() => onRowHover?.(null)}
                        onClick={(e) => onRowClick?.(item.id, e.ctrlKey || e.metaKey)}
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
                        
                        <div className="px-3 flex items-center h-full font-medium text-foreground text-xs" style={{ paddingLeft: `${12 + indentWidth}px` }}>
                          {/* Always show chevron for items with children, regardless of expand/collapse state */}
                          {itemHasChildren ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                console.log('🔴 Button clicked - preventing default and stopping propagation');
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🔴 Chevron clicked for item:', item.id, 'current isExpanded:', item.isExpanded, 'hasChildren:', itemHasChildren);
                                onToggleExpanded(item.id);
                              }}
                              onMouseDown={(e) => {
                                console.log('🟠 Mouse down on chevron for:', item.id);
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              className="mr-2 p-1 rounded hover:bg-accent/20 transition-colors flex-shrink-0 cursor-pointer z-50 relative"
                              style={{ pointerEvents: 'auto' }}
                              title={isExpanded ? "Collapse children" : "Expand children"}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3 h-3 text-muted-foreground pointer-events-none" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-muted-foreground pointer-events-none" />
                              )}
                            </button>
                          ) : (
                            <div className="w-4 mr-2 flex-shrink-0" /> // Spacer for items without children
                          )}
                          
                          <EditableCell
                            id={item.id}
                            type="task"
                            field="name"
                            value={item.name}
                            placeholder="Untitled Task"
                            className="font-medium text-xs text-muted-foreground flex-1"
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