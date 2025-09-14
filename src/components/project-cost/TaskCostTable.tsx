import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, X, ChevronDown, ChevronRight, MoreHorizontal, Edit2, Copy, Trash2 } from 'lucide-react';
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

  // Group WBS items by stage using the hierarchical structure (roots are stages)
  const groupedWBSData = (wbsItems || []).reduce((acc, stage) => {
    const isStage = stage.level === 0 || (stage.wbs_id?.endsWith('.0'));
    if (!isStage) return acc;

    const key = stage.id || stage.wbs_id || stage.title || Math.random().toString();
    const components = Array.isArray(stage.children) ? stage.children : [];
    const elements = components.flatMap((comp) => 
      Array.isArray(comp.children) ? comp.children.map(el => ({ ...el, parentComponent: comp })) : []
    );

    acc[key] = {
      id: key,
      stage,
      components,
      elements
    };
    return acc;
  }, {} as Record<string, { id: string; stage: WBSItem; components: WBSItem[]; elements: (WBSItem & { parentComponent?: WBSItem })[] }>);

  const groupedData = Object.keys(groupedWBSData).length > 0 ? groupedWBSData : {};

  // Auto-expand all stages by default for better UX
  React.useEffect(() => {
    const hasStages = Object.keys(groupedData).length > 0;
    if (hasStages && expandedStages.size === 0) {
      setExpandedStages(new Set(Object.keys(groupedData)));
    }
  }, [Object.keys(groupedData).length]);

  const toggleStage = (stage: string) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stage)) {
      newExpanded.delete(stage);
    } else {
      newExpanded.add(stage);
    }
    setExpandedStages(newExpanded);
  };

  const handleCellClick = (itemId: string, field: string, currentValue: any) => {
    setEditingCell({ taskId: itemId, field });
    setEditValue(currentValue?.toString() || '');
  };

  const handleCellSave = async () => {
    if (!editingCell) return;
    
    try {
      // For WBS items, we need to update the WBS database
      const updates: any = {};
      if (editingCell.field === 'budgeted_cost') {
        updates.budgeted_cost = parseFloat(editValue) || 0;
      } else if (editingCell.field === 'actual_cost') {
        updates.actual_cost = parseFloat(editValue) || 0;
      }
      
      // Find the WBS item to update
      const wbsItem = wbsItems.find(item => item.id === editingCell.taskId);
      if (wbsItem) {
        // Update WBS item in database (you'll need to add this to your WBS service)
        console.log('Would update WBS item:', editingCell.taskId, updates);
        // TODO: Add WBS update function when available
      } else {
        // Fall back to task update for any actual tasks
        await onUpdateTask(editingCell.taskId, updates);
      }
      
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

  // Create flat list for rendering
  const flatWBSItems = Object.values(groupedData)
    .sort((a, b) => (a.stage.wbs_id || '').localeCompare(b.stage.wbs_id || ''))
    .flatMap((stageData) => {
      const stageKey = stageData.id;
      const isExpanded = expandedStages.has(stageKey);
      
      const items = [stageData.stage];
      
      if (isExpanded) {
        // Add components
        stageData.components.forEach(comp => items.push(comp));
        // Add elements
        stageData.elements.forEach(elem => items.push(elem));
      }
      
      return items;
    });

  const EditableCell = ({ id, field, value, placeholder, className }: any) => {
    const isEditing = editingCell?.taskId === id && editingCell?.field === field;
    const currentValue = value || 0;

    if (isEditing) {
      return (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleCellSave}
          onKeyDown={handleKeyDown}
          className="h-6 text-xs p-1 border-blue-300 focus:ring-1 focus:ring-blue-500"
          autoFocus
          type={field.includes('cost') ? 'number' : 'text'}
        />
      );
    }

    return (
      <div 
        className={`cursor-pointer hover:bg-blue-50 rounded px-1 ${className}`}
        onClick={() => handleCellClick(id, field, currentValue)}
      >
        {field.includes('cost') ? formatCurrency(currentValue) : (value || placeholder)}
      </div>
    );
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      {/* Table Header */}
      <div className="bg-muted/30 border-b px-6 py-3">
        <div className="flex items-center justify-end">
          {/* Stage Management button will be added from parent component */}
        </div>
      </div>

      {/* Approach 1: Single CSS Grid - Most Reliable */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-max">
          {/* Header Row */}
          <div 
            className="bg-slate-100/70 border-b border-slate-200 text-xs font-medium text-slate-700 sticky top-0 z-10"
            style={{
              display: 'grid',
              gridTemplateColumns: '32px 120px 200px 200px 120px 120px 120px 100px 140px 84px',
              height: '32px'
            }}
          >
            <div className="flex items-center justify-center border-r border-slate-200"></div>
            <div className="flex items-center px-2 font-semibold border-r border-slate-200">WBS</div>
            <div className="flex items-center px-3 font-semibold border-r border-slate-200">NAME</div>
            <div className="flex items-center px-3 font-semibold border-r border-slate-200">DESCRIPTION</div>
            <div className="flex items-center justify-end px-2 font-semibold border-r border-slate-200">BUDGET</div>
            <div className="flex items-center justify-end px-2 font-semibold border-r border-slate-200">ACTUAL</div>
            <div className="flex items-center justify-end px-2 font-semibold border-r border-slate-200">VARIANCE</div>
            <div className="flex items-center px-2 font-semibold border-r border-slate-200">COST CODE</div>
            <div className="flex items-center px-2 font-semibold border-r border-slate-200">STATUS</div>
            <div className="flex items-center px-2 font-semibold">ACTIONS</div>
          </div>

          {/* Content Rows */}
          <div>
            {flatWBSItems.length === 0 ? (
              <div 
                className="flex items-center justify-center h-64 border-b border-slate-100"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 120px 200px 200px 120px 120px 120px 100px 140px 84px',
                }}
              >
                <div className="col-span-10 flex flex-col items-center justify-center">
                  <p className="text-sm text-muted-foreground mb-2">No cost items found</p>
                  <Button size="sm" variant="outline" className="text-xs bg-white/20 border-white/30 text-foreground hover:bg-white/30">
                    + Add your first cost item
                  </Button>
                </div>
              </div>
            ) : (
              flatWBSItems.map((item) => {
                const isExpanded = expandedStages.has(item.id);
                
                return (
                  <div
                    key={item.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                      item.level === 0 
                        ? 'bg-gradient-to-r from-slate-100 via-blue-50 to-slate-100 border-l-[6px] border-l-blue-800' 
                        : item.level === 1
                        ? 'bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 border-l-[4px] border-l-blue-400'
                        : 'bg-white border-l-2 border-l-slate-300'
                    }`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '32px 120px 200px 200px 120px 120px 120px 100px 140px 84px',
                      height: '32px',
                      alignItems: 'center'
                    }}
                  >
                    {/* Expand/Collapse Icon */}
                    <div 
                      className="flex items-center justify-center cursor-pointer"
                      onClick={() => item.level === 0 ? toggleStage(item.id) : undefined}
                    >
                      {item.level === 0 && (
                        isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        )
                      )}
                    </div>

                    {/* WBS Column */}
                    <div className="flex items-center px-2 text-xs font-mono border-r border-slate-100">
                      <div style={{ 
                        paddingLeft: item.level === 0 ? '0px' : item.level === 1 ? '16px' : '32px' 
                      }}>
                        {item.wbs_id}
                      </div>
                    </div>

                    {/* Name Column */}
                    <div className="flex items-center px-3 text-xs border-r border-slate-100">
                      <div style={{ 
                        paddingLeft: item.level === 0 ? '0px' : item.level === 1 ? '8px' : '24px' 
                      }} className="flex items-center w-full">
                        {item.level === 1 && (
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 flex-shrink-0"></div>
                        )}
                        {item.level === 2 && (
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 flex-shrink-0"></div>
                        )}
                        <span className="font-medium truncate">
                          {item.title || 'Untitled Phase'}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex items-center px-3 text-muted-foreground text-xs border-r border-slate-100">
                      <EditableCell
                        id={item.id}
                        field="description"
                        value={item.description || ''}
                        placeholder="Add description..."
                        className="text-xs text-muted-foreground w-full"
                      />
                    </div>

                    {/* Budget */}
                    <div className="flex items-center justify-end px-2 text-xs text-muted-foreground border-r border-slate-100">
                      <EditableCell
                        id={item.id}
                        field="budgeted_cost"
                        value={item.budgeted_cost || 0}
                        placeholder="$0"
                        className="text-xs text-muted-foreground text-right w-full"
                      />
                    </div>

                    {/* Actual */}
                    <div className="flex items-center justify-end px-2 text-xs text-muted-foreground border-r border-slate-100">
                      <EditableCell
                        id={item.id}
                        field="actual_cost"
                        value={item.actual_cost || 0}
                        placeholder="$0"
                        className="text-xs text-muted-foreground text-right w-full"
                      />
                    </div>

                    {/* Variance */}
                    <div className="flex items-center justify-end px-2 text-xs border-r border-slate-100">
                      <span className={`${((item.budgeted_cost || 0) - (item.actual_cost || 0)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs((item.budgeted_cost || 0) - (item.actual_cost || 0)))}
                      </span>
                    </div>

                    {/* Cost Code */}
                    <div className="flex items-center px-2 text-xs text-muted-foreground border-r border-slate-100">
                      <EditableCell
                        id={item.id}
                        field="cost_code"
                        value={''}
                        placeholder="-"
                        className="text-xs text-muted-foreground w-full"
                      />
                    </div>

                    {/* Status */}
                    <div className="flex items-center px-2 text-xs text-muted-foreground border-r border-slate-100">
                      <span className="text-green-600">$0</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-center px-2">
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
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};