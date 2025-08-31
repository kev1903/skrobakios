import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, X, ChevronDown, ChevronRight } from 'lucide-react';
import { CentralTask, TaskUpdate } from '@/services/centralTaskService';
import { WBSItem } from '@/types/wbs';

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

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      {/* Table Header */}
      <div className="bg-muted/30 border-b px-6 py-3">
        <div className="flex items-center justify-end">
          {/* Stage Management button will be added from parent component */}
        </div>
      </div>

      {/* Airtable-style Table */}
      <div className="w-full">
        <table className="w-full">
          {/* Table Headers */}
          <thead className="bg-white/20 border-b border-white/20">
            <tr>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 border-r border-white/20" style={{
              minWidth: '80px'
            }}>
                WBS
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 border-r border-white/20" style={{
              minWidth: '200px'
            }}>
                NAME
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 border-r border-white/20" style={{
              minWidth: '120px'
            }}>
                Cost Estimate
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 border-r border-white/20" style={{
              minWidth: '120px'
            }}>
                Project Budget
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 border-r border-white/20" style={{
              minWidth: '120px'
            }}>
                Cost Committed
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 border-r border-white/20" style={{
              minWidth: '120px'
            }}>
                Paid to Date
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3" style={{
              minWidth: '100px'
            }}>
                Cost
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white/5">
            {Object.keys(groupedData).length === 0 ? (
              <tr>
                <td colSpan={7} className="px-2 py-6 text-center text-muted-foreground">
                  <div className="flex flex-col items-center">
                    <p className="text-xs mb-2">No cost items found</p>
                    <Button size="sm" variant="outline" className="text-xs bg-white/20 border-white/30 text-foreground hover:bg-white/30">
                      + Add your first cost item
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              Object.values(groupedData)
                .sort((a, b) => (a.stage.wbs_id || '').localeCompare(b.stage.wbs_id || ''))
                .flatMap((stageData) => {
                  const stageKey = stageData.id;
                  const isExpanded = expandedStages.has(stageKey);
                  
                  // Calculate totals from components and elements
                  const stageTotal = stageData.components.reduce((sum, comp) => sum + (comp.budgeted_cost || 0), 0) +
                                     stageData.elements.reduce((sum, elem) => sum + (elem.budgeted_cost || 0), 0);
                  const stageActualTotal = stageData.components.reduce((sum, comp) => sum + (comp.actual_cost || 0), 0) +
                                           stageData.elements.reduce((sum, elem) => sum + (elem.actual_cost || 0), 0);

                  const rows: JSX.Element[] = [];

                  rows.push(
                    <tr 
                      key={`stage-${stageKey}`}
                      className="bg-gray-100 border-b border-gray-200 hover:bg-gray-200 cursor-pointer transition-colors"
                      onClick={() => toggleStage(stageKey)}
                    >
                      <td className="px-3 py-3 text-xs font-semibold text-gray-900 border-r border-gray-200">
                        <div className="flex items-center">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 mr-2 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 mr-2 text-gray-600" />
                          )}
                          <span className="font-mono">{stageData.stage.wbs_id || '1'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs font-semibold text-gray-900 border-r border-gray-200">
                        <div className="flex items-center">
                          <span>{stageData.stage.title || 'Stage'}</span>
                          <span className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs text-gray-600">
                            {stageData.components.length + stageData.elements.length} items
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs font-semibold text-gray-900 border-r border-gray-200 text-right">
                        {formatCurrency(stageTotal)}
                      </td>
                      <td className="px-3 py-3 text-xs font-semibold text-gray-900 border-r border-gray-200 text-right">
                        {formatCurrency(stageTotal)}
                      </td>
                      <td className="px-3 py-3 text-xs font-semibold text-gray-900 border-r border-gray-200 text-right">
                        {formatCurrency(stageActualTotal)}
                      </td>
                      <td className="px-3 py-3 text-xs font-semibold text-gray-900 border-r border-gray-200 text-right">
                        $0.00
                      </td>
                      <td className="px-3 py-3 text-xs font-semibold text-gray-900 text-right">
                        {formatCurrency(stageTotal)}
                      </td>
                    </tr>
                  );

                  if (isExpanded) {
                    // Components
                    stageData.components.forEach((component) => {
                      const budgeted = component.budgeted_cost || 0;
                      const actual = component.actual_cost || 0;
                      const isEditingBudgeted = editingCell?.taskId === component.id && editingCell?.field === 'budgeted_cost';
                      const isEditingActual = editingCell?.taskId === component.id && editingCell?.field === 'actual_cost';

                      rows.push(
                        <tr key={`component-${component.id}`} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors group bg-blue-50/10">
                          {/* WBS Code */}
                          <td className="px-6 py-2 text-xs text-gray-700 border-r border-gray-100 font-mono">
                            {component.wbs_id}
                          </td>

                          {/* Name */}
                          <td className="px-4 py-2 border-r border-gray-100 text-xs text-gray-800 font-medium">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                              {component.title}
                            </div>
                          </td>

                          {/* Cost Estimate */}
                          <td 
                            className="px-3 py-2 text-xs text-gray-900 border-r border-gray-100 cursor-pointer hover:bg-blue-100 text-right transition-colors"
                            onClick={() => handleCellClick(component.id, 'budgeted_cost', budgeted)}
                          >
                            {isEditingBudgeted ? (
                              <div className="flex items-center space-x-1">
                                <Input 
                                  type="number" 
                                  value={editValue} 
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={handleKeyDown}
                                  onBlur={handleCellSave}
                                  className="w-full text-xs border-blue-300 rounded h-6 px-1 text-right"
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <span className="text-xs font-medium">{formatCurrency(budgeted)}</span>
                            )}
                          </td>

                          {/* Project Budget */}
                          <td className="px-3 py-2 text-xs text-gray-900 border-r border-gray-100 text-right">
                            <span className="text-xs">{formatCurrency(budgeted)}</span>
                          </td>

                          {/* Cost Committed */}
                          <td 
                            className="px-3 py-2 text-xs text-gray-900 border-r border-gray-100 cursor-pointer hover:bg-blue-100 text-right transition-colors"
                            onClick={() => handleCellClick(component.id, 'actual_cost', actual)}
                          >
                            {isEditingActual ? (
                              <div className="flex items-center space-x-1">
                                <Input 
                                  type="number" 
                                  value={editValue} 
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={handleKeyDown}
                                  onBlur={handleCellSave}
                                  className="w-full text-xs border-blue-300 rounded h-6 px-1 text-right"
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <span className="text-xs font-medium">{formatCurrency(actual)}</span>
                            )}
                          </td>

                          {/* Paid to Date */}
                          <td className="px-3 py-2 text-xs text-gray-600 border-r border-gray-100 text-right">
                            <span className="text-xs">$0.00</span>
                          </td>

                          {/* Cost */}
                          <td className="px-3 py-2 text-xs text-gray-900 text-right">
                            <span className="text-xs font-medium">{formatCurrency(budgeted)}</span>
                          </td>
                        </tr>
                      );
                    });

                    // Elements
                    stageData.elements.forEach((element) => {
                      const budgeted = element.budgeted_cost || 0;
                      const actual = element.actual_cost || 0;
                      const isEditingBudgeted = editingCell?.taskId === element.id && editingCell?.field === 'budgeted_cost';
                      const isEditingActual = editingCell?.taskId === element.id && editingCell?.field === 'actual_cost';

                      rows.push(
                        <tr key={`element-${element.id}`} className="border-b border-gray-100 hover:bg-green-50/30 transition-colors group bg-green-50/10">
                          {/* WBS Code */}
                          <td className="px-8 py-2 text-xs text-gray-600 border-r border-gray-100 font-mono">
                            {element.wbs_id}
                          </td>

                          {/* Name */}
                          <td className="px-6 py-2 text-xs text-gray-700 border-r border-gray-100 max-w-xs">
                            <div className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                              <div className="truncate" title={element.title}>
                                {element.title}
                              </div>
                            </div>
                          </td>

                          {/* Cost Estimate */}
                          <td 
                            className="px-3 py-2 text-xs text-gray-900 border-r border-gray-100 cursor-pointer hover:bg-green-100 text-right transition-colors"
                            onClick={() => handleCellClick(element.id, 'budgeted_cost', budgeted)}
                          >
                            {isEditingBudgeted ? (
                              <div className="flex items-center space-x-1">
                                <Input 
                                  type="number" 
                                  value={editValue} 
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={handleKeyDown}
                                  onBlur={handleCellSave}
                                  className="w-full text-xs border-blue-300 rounded h-6 px-1 text-right"
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <span className="text-xs">{formatCurrency(budgeted)}</span>
                            )}
                          </td>

                          {/* Project Budget */}
                          <td className="px-3 py-2 text-xs text-gray-900 border-r border-gray-100 text-right">
                            <span className="text-xs">{formatCurrency(budgeted)}</span>
                          </td>

                          {/* Cost Committed */}
                          <td 
                            className="px-3 py-2 text-xs text-gray-900 border-r border-gray-100 cursor-pointer hover:bg-green-100 text-right transition-colors"
                            onClick={() => handleCellClick(element.id, 'actual_cost', actual)}
                          >
                            {isEditingActual ? (
                              <div className="flex items-center space-x-1">
                                <Input 
                                  type="number" 
                                  value={editValue} 
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={handleKeyDown}
                                  onBlur={handleCellSave}
                                  className="w-full text-xs border-blue-300 rounded h-6 px-1 text-right"
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <span className="text-xs">{formatCurrency(actual)}</span>
                            )}
                          </td>

                          {/* Paid to Date */}
                          <td className="px-3 py-2 text-xs text-gray-600 border-r border-gray-100 text-right">
                            <span className="text-xs">$0.00</span>
                          </td>

                          {/* Cost */}
                          <td className="px-3 py-2 text-xs text-gray-900 text-right">
                            <span className="text-xs">{formatCurrency(budgeted)}</span>
                          </td>
                        </tr>
                      );
                    });
                  }

                  return rows;
                })
            )}
          </tbody>

          {/* Table Footer with Totals */}
          <tfoot className="bg-gray-50 border-t-2 border-gray-200">
            <tr>
              <td colSpan={2} className="px-2 py-1 text-xs font-medium text-gray-700 border-r border-gray-200">
                Total
              </td>
              <td className="px-2 py-1 text-xs font-bold text-gray-900 border-r border-gray-200 text-right">
                <span className="text-xs">
                  {formatCurrency(wbsItems.reduce((sum, item) => sum + (item.budgeted_cost || 0), 0))}
                </span>
              </td>
              <td className="px-2 py-1 text-xs font-bold text-gray-900 border-r border-gray-200 text-right">
                <span className="text-xs">
                  {formatCurrency(wbsItems.reduce((sum, item) => sum + (item.budgeted_cost || 0), 0))}
                </span>
              </td>
              <td className="px-2 py-1 text-xs font-bold text-gray-900 border-r border-gray-200 text-right">
                <span className="text-xs">
                  {formatCurrency(wbsItems.reduce((sum, item) => sum + (item.actual_cost || 0), 0))}
                </span>
              </td>
              <td className="px-2 py-1 text-xs font-bold text-gray-900 border-r border-gray-200 text-right">
                <span className="text-xs">$0.00</span>
              </td>
              <td className="px-2 py-1 text-xs font-bold text-gray-900 text-right">
                <span className="text-xs">
                  {formatCurrency(wbsItems.reduce((sum, item) => sum + (item.budgeted_cost || 0), 0))}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};