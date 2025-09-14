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

      {/* Perfectly aligned table using CSS Grid simulation with table elements */}
      <div className="w-full overflow-x-auto">
        <style>{`
          .perfect-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            table-layout: fixed;
          }
          .perfect-table th,
          .perfect-table td {
            margin: 0;
            padding: 0;
            border: none;
            vertical-align: middle;
            line-height: 1.2;
            font-size: 12px;
          }
          .perfect-table .cell-content {
            padding: 12px;
            border-right: 1px solid rgba(229, 231, 235, 1);
            border-bottom: 1px solid rgba(229, 231, 235, 0.5);
            height: 100%;
            box-sizing: border-box;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: block;
          }
          .perfect-table .cell-content.no-border-right {
            border-right: none;
          }
          .perfect-table .cell-content.header {
            background-color: rgba(255, 255, 255, 0.2);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            font-weight: 500;
            color: hsl(var(--muted-foreground));
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .perfect-table .cell-content.stage {
            background-color: #f3f4f6;
            border-bottom: 1px solid #e5e7eb;
            font-weight: 600;
            color: #111827;
            cursor: pointer;
          }
          .perfect-table .cell-content.stage:hover {
            background-color: #e5e7eb;
          }
          .perfect-table .cell-content.component {
            background-color: rgba(59, 130, 246, 0.1);
            border-bottom: 1px solid #f3f4f6;
            color: #374151;
          }
          .perfect-table .cell-content.component:hover {
            background-color: rgba(59, 130, 246, 0.2);
          }
          .perfect-table .cell-content.element {
            background-color: rgba(34, 197, 94, 0.1);
            border-bottom: 1px solid #f3f4f6;
            color: #374151;
          }
          .perfect-table .cell-content.element:hover {
            background-color: rgba(34, 197, 94, 0.2);
          }
          .perfect-table .cell-content.clickable {
            cursor: pointer;
          }
          .perfect-table .cell-content.text-left {
            text-align: left;
          }
          .perfect-table .cell-content.text-right {
            text-align: right;
          }
          .perfect-table .cell-content.text-center {
            text-align: center;
          }
          .perfect-table .wbs-content {
            font-family: monospace;
          }
          .perfect-table .stage-content {
            position: relative;
            padding-left: 28px;
          }
          .perfect-table .stage-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            width: 16px;
            height: 16px;
            color: #6b7280;
          }
          .perfect-table .component-content {
            position: relative;
            padding-left: 32px;
          }
          .perfect-table .component-dot {
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            width: 8px;
            height: 8px;
            background-color: #60a5fa;
            border-radius: 50%;
          }
          .perfect-table .element-content {
            position: relative;
            padding-left: 48px;
          }
          .perfect-table .element-dot {
            position: absolute;
            left: 36px;
            top: 50%;
            transform: translateY(-50%);
            width: 6px;
            height: 6px;
            background-color: #4ade80;
            border-radius: 50%;
          }
          .perfect-table .total-row .cell-content {
            background-color: #f9fafb;
            border-top: 2px solid #e5e7eb;
            border-bottom: none;
            font-weight: 700;
            color: #111827;
          }
        `}</style>
        
        <table className="perfect-table">
          <colgroup>
            <col style={{ width: '80px' }} />
            <col style={{ width: '200px' }} />
            <col style={{ width: '180px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '90px' }} />
            <col style={{ width: '80px' }} />
            <col style={{ width: '90px' }} />
          </colgroup>
          
          <thead>
            <tr>
              <th><div className="cell-content header text-left">WBS</div></th>
              <th><div className="cell-content header text-left">NAME</div></th>
              <th><div className="cell-content header text-left">DESCRIPTION</div></th>
              <th><div className="cell-content header text-right">BUDGET</div></th>
              <th><div className="cell-content header text-right">ACTUAL</div></th>
              <th><div className="cell-content header text-right">VARIANCE</div></th>
              <th><div className="cell-content header text-center">COST CODE</div></th>
              <th><div className="cell-content header text-center">STATUS</div></th>
              <th><div className="cell-content header text-center no-border-right">ACTIONS</div></th>
            </tr>
          </thead>

          <tbody>
            {Object.keys(groupedData).length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="cell-content text-center" style={{ padding: '24px', color: 'hsl(var(--muted-foreground))' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <p style={{ marginBottom: '8px' }}>No cost items found</p>
                      <Button size="sm" variant="outline" className="text-xs bg-white/20 border-white/30 text-foreground hover:bg-white/30">
                        + Add your first cost item
                      </Button>
                    </div>
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

                  // Stage row
                  rows.push(
                    <tr key={`stage-${stageKey}`}>
                      <td>
                        <div className="cell-content stage text-left" onClick={() => toggleStage(stageKey)}>
                          <div className="stage-content wbs-content">
                            {isExpanded ? (
                              <ChevronDown className="stage-icon" />
                            ) : (
                              <ChevronRight className="stage-icon" />
                            )}
                            {stageData.stage.wbs_id || '1'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="cell-content stage text-left" onClick={() => toggleStage(stageKey)}>
                          {stageData.stage.title || 'Untitled Phase'}
                        </div>
                      </td>
                      <td>
                        <div className="cell-content stage text-left" onClick={() => toggleStage(stageKey)}>
                          <span style={{ color: 'hsl(var(--muted-foreground))' }}>Add description...</span>
                        </div>
                      </td>
                      <td>
                        <div className="cell-content stage text-right" onClick={() => toggleStage(stageKey)}>
                          {formatCurrency(stageTotal)}
                        </div>
                      </td>
                      <td>
                        <div className="cell-content stage text-right" onClick={() => toggleStage(stageKey)}>
                          {formatCurrency(stageActualTotal)}
                        </div>
                      </td>
                      <td>
                        <div className="cell-content stage text-right" onClick={() => toggleStage(stageKey)}>
                          <span style={{ color: (stageTotal - stageActualTotal) >= 0 ? '#059669' : '#dc2626' }}>
                            {formatCurrency(Math.abs(stageTotal - stageActualTotal))}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="cell-content stage text-center" onClick={() => toggleStage(stageKey)}>
                          <span style={{ color: 'hsl(var(--muted-foreground))' }}>-</span>
                        </div>
                      </td>
                      <td>
                        <div className="cell-content stage text-center" onClick={() => toggleStage(stageKey)}>
                          <span style={{ color: '#059669' }}>$0</span>
                        </div>
                      </td>
                      <td>
                        <div className="cell-content stage text-center no-border-right" onClick={() => toggleStage(stageKey)}>
                          <span style={{ color: 'hsl(var(--muted-foreground))' }}>-</span>
                        </div>
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
                        <tr key={`component-${component.id}`}>
                          <td>
                            <div className="cell-content component text-left">
                              <div className="component-content wbs-content">
                                {component.wbs_id}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="cell-content component text-left">
                              <div className="component-content">
                                <div className="component-dot"></div>
                                {component.title || 'Untitled Component'}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="cell-content component text-left">
                              <span style={{ color: 'hsl(var(--muted-foreground))' }}>Add description...</span>
                            </div>
                          </td>
                          <td>
                            <div 
                              className="cell-content component text-right clickable"
                              onClick={() => handleCellClick(component.id, 'budgeted_cost', budgeted)}
                            >
                              {isEditingBudgeted ? (
                                <Input 
                                  type="number" 
                                  value={editValue} 
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={handleKeyDown}
                                  onBlur={handleCellSave}
                                  style={{ 
                                    width: '100%', 
                                    fontSize: '12px', 
                                    height: '20px', 
                                    padding: '2px 4px', 
                                    textAlign: 'right',
                                    border: '1px solid #3b82f6',
                                    borderRadius: '2px'
                                  }}
                                  autoFocus
                                />
                              ) : (
                                formatCurrency(budgeted)
                              )}
                            </div>
                          </td>
                          <td>
                            <div 
                              className="cell-content component text-right clickable"
                              onClick={() => handleCellClick(component.id, 'actual_cost', actual)}
                            >
                              {isEditingActual ? (
                                <Input 
                                  type="number" 
                                  value={editValue} 
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={handleKeyDown}
                                  onBlur={handleCellSave}
                                  style={{ 
                                    width: '100%', 
                                    fontSize: '12px', 
                                    height: '20px', 
                                    padding: '2px 4px', 
                                    textAlign: 'right',
                                    border: '1px solid #3b82f6',
                                    borderRadius: '2px'
                                  }}
                                  autoFocus
                                />
                              ) : (
                                formatCurrency(actual)
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="cell-content component text-right">
                              <span style={{ color: (budgeted - actual) >= 0 ? '#059669' : '#dc2626' }}>
                                {formatCurrency(Math.abs(budgeted - actual))}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="cell-content component text-center">
                              <span style={{ color: 'hsl(var(--muted-foreground))' }}>-</span>
                            </div>
                          </td>
                          <td>
                            <div className="cell-content component text-center">
                              <span style={{ color: '#059669' }}>$0</span>
                            </div>
                          </td>
                          <td>
                            <div className="cell-content component text-center no-border-right">
                              <span style={{ color: 'hsl(var(--muted-foreground))' }}>-</span>
                            </div>
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
                        <tr key={`element-${element.id}`}>
                          <td>
                            <div className="cell-content element text-left">
                              <div className="element-content wbs-content">
                                {element.wbs_id}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="cell-content element text-left">
                              <div className="element-content">
                                <div className="element-dot"></div>
                                {element.title || 'Untitled Element'}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="cell-content element text-left">
                              <span style={{ color: 'hsl(var(--muted-foreground))' }}>Add description...</span>
                            </div>
                          </td>
                          <td>
                            <div 
                              className="cell-content element text-right clickable"
                              onClick={() => handleCellClick(element.id, 'budgeted_cost', budgeted)}
                            >
                              {isEditingBudgeted ? (
                                <Input 
                                  type="number" 
                                  value={editValue} 
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={handleKeyDown}
                                  onBlur={handleCellSave}
                                  style={{ 
                                    width: '100%', 
                                    fontSize: '12px', 
                                    height: '20px', 
                                    padding: '2px 4px', 
                                    textAlign: 'right',
                                    border: '1px solid #3b82f6',
                                    borderRadius: '2px'
                                  }}
                                  autoFocus
                                />
                              ) : (
                                formatCurrency(budgeted)
                              )}
                            </div>
                          </td>
                          <td>
                            <div 
                              className="cell-content element text-right clickable"
                              onClick={() => handleCellClick(element.id, 'actual_cost', actual)}
                            >
                              {isEditingActual ? (
                                <Input 
                                  type="number" 
                                  value={editValue} 
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={handleKeyDown}
                                  onBlur={handleCellSave}
                                  style={{ 
                                    width: '100%', 
                                    fontSize: '12px', 
                                    height: '20px', 
                                    padding: '2px 4px', 
                                    textAlign: 'right',
                                    border: '1px solid #3b82f6',
                                    borderRadius: '2px'
                                  }}
                                  autoFocus
                                />
                              ) : (
                                formatCurrency(actual)
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="cell-content element text-right">
                              <span style={{ color: (budgeted - actual) >= 0 ? '#059669' : '#dc2626' }}>
                                {formatCurrency(Math.abs(budgeted - actual))}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="cell-content element text-center">
                              <span style={{ color: 'hsl(var(--muted-foreground))' }}>-</span>
                            </div>
                          </td>
                          <td>
                            <div className="cell-content element text-center">
                              <span style={{ color: '#059669' }}>$0</span>
                            </div>
                          </td>
                          <td>
                            <div className="cell-content element text-center no-border-right">
                              <span style={{ color: 'hsl(var(--muted-foreground))' }}>-</span>
                            </div>
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
          <tfoot>
            <tr className="total-row">
              <td colSpan={3}>
                <div className="cell-content text-left">Total</div>
              </td>
              <td>
                <div className="cell-content text-right">
                  {formatCurrency(wbsItems.reduce((sum, item) => sum + (item.budgeted_cost || 0), 0))}
                </div>
              </td>
              <td>
                <div className="cell-content text-right">
                  {formatCurrency(wbsItems.reduce((sum, item) => sum + (item.actual_cost || 0), 0))}
                </div>
              </td>
              <td>
                <div className="cell-content text-right">$0.00</div>
              </td>
              <td>
                <div className="cell-content text-center">
                  <span style={{ color: 'hsl(var(--muted-foreground))' }}>-</span>
                </div>
              </td>
              <td>
                <div className="cell-content text-center">
                  <span style={{ color: 'hsl(var(--muted-foreground))' }}>-</span>
                </div>
              </td>
              <td>
                <div className="cell-content text-center no-border-right">
                  <span style={{ color: 'hsl(var(--muted-foreground))' }}>-</span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};