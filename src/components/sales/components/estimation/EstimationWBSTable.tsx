import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle, memo, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, ChevronDown, Plus, Trash2, GripVertical } from 'lucide-react';

interface EstimationItem {
  id: string;
  wbsNumber: string;
  name: string;
  level: number;
  isExpanded: boolean;
  quantity?: number;
  unit?: string;
  unitRate?: number;
  totalCost?: number;
  children?: EstimationItem[];
}

interface EstimationWBSTableProps {
  onDataChange?: (data: any) => void;
}

export const EstimationWBSTable = forwardRef(({ onDataChange }: EstimationWBSTableProps, ref) => {
  // Initialize with empty rows for Excel-like grid
  const [items, setItems] = useState<EstimationItem[]>(
    Array.from({ length: 15 }, (_, i) => ({
      id: `row-${i + 1}`,
      wbsNumber: `${i + 1}`,
      name: '',
      level: 0,
      isExpanded: false,
      quantity: 0,
      unit: '',
      unitRate: 0,
      totalCost: 0
    }))
  );

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);
  const inputRefsMap = useRef<Map<string, Map<string, HTMLInputElement>>>(new Map());

  useImperativeHandle(ref, () => ({
    indentSelected: () => {
      if (selectedId) indentItem(selectedId);
    },
    outdentSelected: () => {
      if (selectedId) outdentItem(selectedId);
    },
    getData: () => {
      return items.filter(item => item.name.trim() !== '' || item.quantity !== 0);
    },
    setData: (data: EstimationItem[]) => {
      setItems(data);
    }
  }));

  // Flatten items for rendering
  const flattenItems = (items: EstimationItem[]): EstimationItem[] => {
    const result: EstimationItem[] = [];
    
    const flatten = (item: EstimationItem) => {
      result.push(item);
      if (item.isExpanded && item.children) {
        item.children.forEach(flatten);
      }
    };
    
    items.forEach(flatten);
    return result;
  };

  const visibleItems = flattenItems(items);

  const setInputRef = (itemId: string, fieldName: string, element: HTMLInputElement | null) => {
    if (!inputRefsMap.current.has(itemId)) {
      inputRefsMap.current.set(itemId, new Map());
    }
    if (element) {
      inputRefsMap.current.get(itemId)?.set(fieldName, element);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, itemId: string, fieldName: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentIndex = visibleItems.findIndex(item => item.id === itemId);
      if (currentIndex < visibleItems.length - 1) {
        const nextItem = visibleItems[currentIndex + 1];
        const nextInput = inputRefsMap.current.get(nextItem.id)?.get(fieldName);
        nextInput?.focus();
        nextInput?.select();
      }
    }
  };

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    const newItems = Array.from(items);
    const [removed] = newItems.splice(sourceIndex, 1);
    newItems.splice(destinationIndex, 0, removed);
    
    // Update WBS numbers
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      wbsNumber: `${index + 1}`
    }));
    
    setItems(updatedItems);
  }, [items]);

  const handleSelectRow = useCallback((itemId: string) => {
    setSelectedId(itemId);
  }, []);

  const handleHoverEnter = useCallback((itemId: string) => {
    setHoveredId(itemId);
  }, []);

  const handleHoverLeave = useCallback(() => {
    setHoveredId(null);
  }, []);

  const toggleExpanded = useCallback((itemId: string) => {
    const updateItem = (items: EstimationItem[]): EstimationItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, isExpanded: !item.isExpanded };
        }
        if (item.children) {
          return { ...item, children: updateItem(item.children) };
        }
        return item;
      });
    };
    
    setItems(updateItem(items));
  }, [items]);

  const updateItemValue = (itemId: string, field: keyof EstimationItem, value: any) => {
    const updateItem = (items: EstimationItem[]): EstimationItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          const updated = { ...item, [field]: value };
          // Recalculate total cost if quantity or unit rate changes
          if (field === 'quantity' || field === 'unitRate') {
            updated.totalCost = (updated.quantity || 0) * (updated.unitRate || 0);
          }
          return updated;
        }
        if (item.children) {
          return { ...item, children: updateItem(item.children) };
        }
        return item;
      });
    };
    
    setItems(updateItem(items));
  };

  const indentItem = (itemId: string) => {
    // Find previous sibling and make selected item its child
    const findAndIndent = (items: EstimationItem[], parentLevel: number = -1): EstimationItem[] => {
      const result: EstimationItem[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.id === itemId && i > 0) {
          const prevSibling = result[result.length - 1];
          if (prevSibling) {
            const newItem = { ...item, level: prevSibling.level + 1 };
            prevSibling.children = [...(prevSibling.children || []), newItem];
            prevSibling.isExpanded = true;
          } else {
            result.push(item);
          }
        } else {
          result.push({
            ...item,
            children: item.children ? findAndIndent(item.children, item.level) : item.children
          });
        }
      }
      return result;
    };
    setItems(findAndIndent(items));
  };

  const outdentItem = (itemId: string) => {
    // Move item up one level in hierarchy
    const findAndOutdent = (items: EstimationItem[], parent: EstimationItem[] | null = null): EstimationItem[] => {
      const result: EstimationItem[] = [];
      for (const item of items) {
        if (item.children) {
          const childIndex = item.children.findIndex(c => c.id === itemId);
          if (childIndex !== -1) {
            const childItem = { ...item.children[childIndex], level: Math.max(0, item.level) };
            result.push({
              ...item,
              children: item.children.filter((_, i) => i !== childIndex)
            });
            result.push(childItem);
            continue;
          }
        }
        result.push({
          ...item,
          children: item.children ? findAndOutdent(item.children, items) : item.children
        });
      }
      return result;
    };
    setItems(findAndOutdent(items));
  };

  // Synchronized scrolling
  const handleLeftScroll = useCallback(() => {
    if (isSyncingRef.current || !leftScrollRef.current || !rightScrollRef.current) return;
    
    isSyncingRef.current = true;
    rightScrollRef.current.scrollTop = leftScrollRef.current.scrollTop;
    setTimeout(() => { isSyncingRef.current = false; }, 10);
  }, []);

  const handleRightScroll = useCallback(() => {
    if (isSyncingRef.current || !leftScrollRef.current || !rightScrollRef.current) return;
    
    isSyncingRef.current = true;
    leftScrollRef.current.scrollTop = rightScrollRef.current.scrollTop;
    setTimeout(() => { isSyncingRef.current = false; }, 10);
  }, []);

  // Calculate totals
  const calculateGrandTotal = () => {
    return visibleItems.reduce((sum, item) => sum + (item.totalCost || 0), 0);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="shrink-0 h-11 px-4 border-b border-border/20 bg-muted/30 flex items-center gap-2">
        <Button size="sm" variant="outline" className="h-8">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Item
        </Button>
        <div className="flex-1" />
        <div className="text-sm font-semibold text-foreground">
          Total: ${calculateGrandTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Split View */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - WBS & Name */}
          <div className="w-[400px] shrink-0 border-r border-border/20 bg-background overflow-hidden">
            <div 
              ref={leftScrollRef}
              onScroll={handleLeftScroll}
              className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin pl-4"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 grid grid-cols-[30px_90px_1fr] h-9 bg-muted/40 border-b border-border/20">
                <div className="px-1 flex items-center">
                  {/* Drag handle header */}
                </div>
                <div className="px-3 flex items-center text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
                  WBS
                </div>
                <div className="px-3 flex items-center text-[10px] uppercase tracking-wide font-semibold text-muted-foreground border-l border-border/20">
                  Description
                </div>
              </div>

              {/* Rows */}
              <Droppable droppableId="estimation-rows">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {visibleItems.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              ...provided.draggableProps.style,
                              ...(snapshot.isDragging && {
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100%',
                                pointerEvents: 'none'
                              })
                            }}
                            className={`grid grid-cols-[30px_90px_1fr] h-9 border-b border-border/10 hover:bg-accent/10 transition-colors ${
                              hoveredId === item.id ? 'bg-accent/10' : ''
                            } ${selectedId === item.id ? 'bg-primary/5 ring-1 ring-inset ring-primary/30' : ''} ${
                              snapshot.isDragging ? 'shadow-lg bg-background/95 backdrop-blur-sm' : ''
                            }`}
                            onMouseEnter={() => handleHoverEnter(item.id)}
                            onMouseLeave={handleHoverLeave}
                            onClick={() => handleSelectRow(item.id)}
                          >
                            <div 
                              {...provided.dragHandleProps}
                              className="px-1 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-accent/20 transition-colors"
                            >
                              <GripVertical className="w-4 h-4 text-muted-foreground/60 hover:text-muted-foreground" />
                            </div>
                            <div className="px-3 flex items-center text-xs text-muted-foreground font-mono tracking-tight">
                              {item.wbsNumber}
                            </div>
                <div className="px-2 flex items-center border-l border-border/10">
                  <div 
                    className="flex items-center gap-1 w-full"
                    style={{ paddingLeft: `${item.level * 16}px` }}
                  >
                    {item.children && item.children.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(item.id);
                        }}
                        className="shrink-0 w-4 h-4 flex items-center justify-center hover:bg-accent/50 rounded-sm transition-colors"
                      >
                        {item.isExpanded ? (
                          <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        )}
                      </button>
                    )}
                    {!item.children && <div className="w-4" />}
                    <Input
                      ref={(el) => setInputRef(item.id, 'name', el)}
                      value={item.name}
                      onChange={(e) => updateItemValue(item.id, 'name', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, item.id, 'name')}
                      className={`h-6 text-xs bg-background border-border/40 px-2 flex-1 ${item.level === 0 ? 'font-semibold' : ''}`}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Description"
                    />
                            </div>
                          </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>

          {/* Right Panel - Estimation Details */}
          <div className="flex-1 overflow-hidden bg-background">
            <div 
              ref={rightScrollRef}
              onScroll={handleRightScroll}
              className="h-full overflow-y-auto overflow-x-auto scrollbar-thin"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 grid grid-cols-[120px_70px_110px_130px_70px] min-w-[600px] h-9 bg-muted/40 border-b border-border/20">
                <div className="px-3 flex items-center text-[10px] uppercase tracking-wide font-semibold text-muted-foreground border-l border-border/20">
                  Quantity
                </div>
                <div className="px-3 flex items-center text-[10px] uppercase tracking-wide font-semibold text-muted-foreground border-l border-border/20">
                  Unit
                </div>
                <div className="px-3 flex items-center text-[10px] uppercase tracking-wide font-semibold text-muted-foreground border-l border-border/20">
                  Unit Rate
                </div>
                <div className="px-3 flex items-center text-[10px] uppercase tracking-wide font-semibold text-muted-foreground border-l border-border/20">
                  Total Cost
                </div>
                <div className="px-3 flex items-center justify-center text-[10px] uppercase tracking-wide font-semibold text-muted-foreground border-l border-border/20">
                  Actions
                </div>
              </div>

              {/* Rows */}
              <Droppable droppableId="estimation-rows-right">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {visibleItems.map((item, index) => (
                      <Draggable key={item.id} draggableId={`${item.id}-right`} index={index} isDragDisabled={true}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              ...provided.draggableProps.style,
                              ...(snapshot.isDragging && {
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100%',
                                pointerEvents: 'none'
                              })
                            }}
                            className={`grid grid-cols-[120px_70px_110px_130px_70px] min-w-[600px] h-9 border-b border-border/10 hover:bg-accent/10 transition-colors ${
                              hoveredId === item.id ? 'bg-accent/10' : ''
                            } ${selectedId === item.id ? 'bg-primary/5 ring-1 ring-inset ring-primary/30' : ''} ${
                              snapshot.isDragging ? 'shadow-lg bg-background/95 backdrop-blur-sm' : ''
                            }`}
                            onMouseEnter={() => handleHoverEnter(item.id)}
                            onMouseLeave={handleHoverLeave}
                            onClick={() => handleSelectRow(item.id)}
                          >
                <div className="px-2 flex items-center border-l border-border/10">
                  <Input
                    ref={(el) => setInputRef(item.id, 'quantity', el)}
                    type="number"
                    value={item.quantity || ''}
                    onChange={(e) => updateItemValue(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    onKeyDown={(e) => handleKeyDown(e, item.id, 'quantity')}
                    className="h-6 text-xs bg-background border-border/40 px-2"
                    onClick={(e) => e.stopPropagation()}
                    placeholder="0"
                  />
                </div>
                <div className="px-2 flex items-center border-l border-border/10">
                  <Select
                    value={item.unit || ''}
                    onValueChange={(value) => updateItemValue(item.id, 'unit', value)}
                  >
                    <SelectTrigger 
                      className="h-6 text-xs bg-background border-border/40 px-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-background">
                      <SelectItem value="No.">No.</SelectItem>
                      <SelectItem value="l/m">l/m</SelectItem>
                      <SelectItem value="m2">m2</SelectItem>
                      <SelectItem value="m3">m3</SelectItem>
                      <SelectItem value="hr">hr</SelectItem>
                      <SelectItem value="day">day</SelectItem>
                      <SelectItem value="week">week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="px-2 flex items-center border-l border-border/10">
                  <Input
                    ref={(el) => setInputRef(item.id, 'unitRate', el)}
                    type="number"
                    value={item.unitRate || ''}
                    onChange={(e) => updateItemValue(item.id, 'unitRate', parseFloat(e.target.value) || 0)}
                    onKeyDown={(e) => handleKeyDown(e, item.id, 'unitRate')}
                    className="h-6 text-xs bg-background border-border/40 px-2"
                    onClick={(e) => e.stopPropagation()}
                    placeholder="0.00"
                  />
                </div>
                <div className="px-3 flex items-center border-l border-border/10">
                  <span className={`text-xs font-mono ${item.level === 0 ? 'font-semibold text-foreground' : 'text-foreground/90'}`}>
                    ${(item.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="px-2 flex items-center justify-center border-l border-border/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-accent/50"
                    disabled={item.level === 0}
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                            </Button>
                          </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
});
