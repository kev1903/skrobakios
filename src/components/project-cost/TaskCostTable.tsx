import React, { useState, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, MoreHorizontal, Edit2, Copy, Trash2, GripVertical, Plus } from 'lucide-react';
import { CentralTask, TaskUpdate } from '@/services/centralTaskService';
import { WBSItem } from '@/types/wbs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface TaskCostTableProps {
  tasks: CentralTask[];
  onUpdateTask: (taskId: string, updates: TaskUpdate) => Promise<void>;
  wbsItems: WBSItem[];
}

export const TaskCostTable = ({
  tasks,
  onUpdateTask,
  wbsItems = []
}: TaskCostTableProps) => {
  const [editingCell, setEditingCell] = useState<{ taskId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  // Create flat list like SCOPE tab - exactly the same filter logic
  const flatWBSItems = (wbsItems || []).filter(item => 
    item.level === 0 || expandedStages.has(getStageId(item))
  );

  const getStageId = (item: WBSItem): string => {
    if (item.level === 0) return item.id;
    // Find parent stage for this item
    const stage = wbsItems.find(stage => 
      stage.level === 0 && 
      (item.wbs_id?.startsWith(stage.wbs_id || '') || false)
    );
    return stage?.id || item.id;
  };

  // Auto-expand all stages by default
  React.useEffect(() => {
    const stageIds = wbsItems.filter(item => item.level === 0).map(item => item.id);
    if (stageIds.length > 0 && expandedStages.size === 0) {
      setExpandedStages(new Set(stageIds));
    }
  }, [wbsItems.length]);

  const toggleStage = (stageId: string) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId);
    } else {
      newExpanded.add(stageId);
    }
    setExpandedStages(newExpanded);
  };

  // Scroll synchronization exactly like SCOPE tab
  const handleRightScroll = useCallback(() => {
    if (leftScrollRef.current && rightScrollRef.current) {
      leftScrollRef.current.scrollTop = rightScrollRef.current.scrollTop;
    }
  }, []);

  const handleLeftScroll = useCallback(() => {
    if (leftScrollRef.current && rightScrollRef.current) {
      rightScrollRef.current.scrollTop = leftScrollRef.current.scrollTop;
    }
  }, []);

  const handleCellClick = (itemId: string, field: string, currentValue: any) => {
    setEditingCell({ taskId: itemId, field });
    setEditValue(currentValue?.toString() || '');
  };

  const handleCellSave = async () => {
    if (!editingCell) return;
    
    try {
      const updates: any = {};
      if (editingCell.field === 'budgeted_cost') {
        updates.budgeted_cost = parseFloat(editValue) || 0;
      } else if (editingCell.field === 'actual_cost') {
        updates.actual_cost = parseFloat(editValue) || 0;
      }
      
      console.log('Would update WBS item:', editingCell.taskId, updates);
      setEditingCell(null);
      setEditValue('');
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellSave();
    } else if (e.key === 'Escape') {
      handleCellCancel();
    }
  };
  
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const EditableCell = ({ id, field, value, placeholder, className }: any) => {
    const isEditing = editingCell?.taskId === id && editingCell?.field === field;
    const currentValue = value || (field.includes('cost') ? 0 : '');

    if (isEditing) {
      return (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleCellSave}
          onKeyDown={handleKeyDown}
          className="h-4 text-xs p-1 border-blue-300 focus:ring-1 focus:ring-blue-500"
          autoFocus
          type={field.includes('cost') ? 'number' : 'text'}
        />
      );
    }

    return (
      <div 
        className={`cursor-pointer hover:bg-blue-50 rounded px-1 w-full ${className}`}
        onClick={() => handleCellClick(id, field, currentValue)}
      >
        {field.includes('cost') ? formatCurrency(currentValue) : (value || placeholder)}
      </div>
    );
  };

  return (
    <div className="flex h-full w-full bg-white overflow-hidden">
      {/* Left Panel - WBS and Name - EXACTLY like WBSLeftPanel */}
      <div className="w-[420px] h-full bg-white border-r border-border flex-shrink-0 overflow-hidden">
        <div ref={leftScrollRef} className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide" onScroll={handleLeftScroll}>
          {flatWBSItems.map((item) => (
            <div
              key={item.id}
              className={`grid items-center border-b border-gray-100 ${
                item.level === 0 
                  ? 'bg-gradient-to-r from-slate-100 via-blue-50 to-slate-100 border-l-[6px] border-l-blue-800 shadow-sm hover:from-blue-50 hover:to-blue-100' 
                  : item.level === 1
                  ? 'bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 border-l-[4px] border-l-blue-400 hover:from-blue-100 hover:to-blue-200'
                  : 'bg-white border-l-2 border-l-slate-300 hover:bg-slate-50/50'
              } cursor-pointer transition-all duration-200 ${hoveredId === item.id ? 'bg-gradient-to-r from-gray-200/80 via-gray-100/60 to-gray-200/80 shadow-lg ring-2 ring-gray-300/50' : ''}`}
              style={{
                gridTemplateColumns: '32px 120px 1fr 40px',
              }}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                const isNameField = target.closest('[data-field="name"]');
                if (!isNameField && item.children && item.children.length > 0 && item.level === 0) {
                  toggleStage(item.id);
                }
              }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Expand/Collapse Icon */}
              <div className="px-2 h-[1.75rem] flex items-center justify-center">
                <div className="flex items-center">
                  <div
                    className={`cursor-grab active:cursor-grabbing p-1 rounded transition-colors duration-200 mr-1 ${
                      item.level === 1 ? 'ml-4' : item.level === 2 ? 'ml-8' : ''
                    } hover:bg-accent/20`}
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-3 h-3 text-muted-foreground" />
                  </div>
                  {item.level === 0 && item.children && item.children.length > 0 && (
                    expandedStages.has(item.id) ? (
                      <ChevronDown className="w-3 h-3 text-gray-700" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-gray-700" />
                    )
                  )}
                </div>
              </div>
              
              {/* WBS Number */}
              <div className={`px-2 h-[1.75rem] flex items-center ${
                item.level === 1 ? 'ml-4' : item.level === 2 ? 'ml-12' : ''
              } ${
                item.level === 0 
                  ? 'font-black text-gray-800 text-sm tracking-wide' 
                  : item.level === 1
                  ? 'font-bold text-gray-700 text-sm'
                  : 'font-medium text-gray-600 text-xs'
              }`}>
                {item.wbs_id}
              </div>
              
              {/* Name */}
              <div className={`px-3 h-[1.75rem] flex items-center ${
                item.level === 1 ? 'ml-4' : item.level === 2 ? 'ml-12' : ''
              } ${
                item.level === 0 
                  ? 'font-black text-gray-800 text-base tracking-wide' 
                  : item.level === 1
                  ? 'font-bold text-gray-700 text-sm'
                  : 'font-medium text-foreground text-xs'
              }`}>
                <div className="flex items-center w-full">
                  {item.level === 1 && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 flex-shrink-0"></div>
                  )}
                  {item.level === 2 && (
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 flex-shrink-0"></div>
                  )}
                  <span className="font-medium truncate" data-field="name">
                    {item.title || 'Untitled Phase'}
                  </span>
                </div>
              </div>
              
              {/* Add Child Button */}
              <div className="px-2 h-[1.75rem] flex items-center">
                {item.level < 2 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Add child logic here if needed
                    }}
                    className="h-6 w-6 p-0 hover:bg-primary/10"
                    title={item.level === 0 ? "Add Component" : "Add Element"}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Right Panel - Cost Data - EXACTLY like WBSTimeRightPanel */}
      <div className="flex-1 min-w-0 bg-white overflow-hidden">
        <div ref={rightScrollRef} className="h-full overflow-y-auto overflow-x-hidden w-full" onScroll={handleRightScroll}>
          {flatWBSItems.map((item) => (
            <div
              key={item.id}
              style={{
                gridTemplateColumns: 'minmax(200px, 1fr) 120px 120px 120px 100px 140px 84px',
              }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Description */}
              <div className="px-3 h-[1.75rem] flex items-center text-muted-foreground text-xs">
                <EditableCell
                  id={item.id}
                  field="description"
                  value={item.description || ''}
                  placeholder="Add description..."
                  className="text-xs text-muted-foreground"
                />
              </div>

              {/* Budget */}
              <div className="px-2 h-[1.75rem] flex items-center text-xs text-muted-foreground justify-end">
                <EditableCell
                  id={item.id}
                  field="budgeted_cost"
                  value={item.budgeted_cost || 0}
                  placeholder="$0"
                  className="text-xs text-muted-foreground text-right w-full"
                />
              </div>

              {/* Actual */}
              <div className="px-2 h-[1.75rem] flex items-center text-xs text-muted-foreground justify-end">
                <EditableCell
                  id={item.id}
                  field="actual_cost"
                  value={item.actual_cost || 0}
                  placeholder="$0"
                  className="text-xs text-muted-foreground text-right w-full"
                />
              </div>

              {/* Variance */}
              <div className="px-2 h-[1.75rem] flex items-center text-xs justify-end">
                <span className="text-green-600">$0</span>
              </div>

              {/* Cost Code */}
              <div className="px-2 h-[1.75rem] flex items-center text-xs text-muted-foreground">
                <EditableCell
                  id={item.id}
                  field="cost_code"
                  value=""
                  placeholder="-"
                  className="text-xs text-muted-foreground w-full"
                />
              </div>

              {/* Status */}
              <div className="px-2 h-[1.75rem] flex items-center">
                <span className="text-xs text-muted-foreground">-</span>
              </div>

              {/* Actions */}
              <div className="px-2 h-[1.75rem] flex items-center justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem>
                      <Edit2 className="w-3 h-3 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="w-3 h-3 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Trash2 className="w-3 h-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};