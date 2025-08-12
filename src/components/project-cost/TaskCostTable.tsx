import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, X, ChevronDown, ChevronRight } from 'lucide-react';
import { CentralTask, TaskUpdate } from '@/services/centralTaskService';
interface TaskCostTableProps {
  tasks: CentralTask[];
  onUpdateTask: (taskId: string, updates: TaskUpdate) => Promise<void>;
}
export const TaskCostTable = ({
  tasks,
  onUpdateTask
}: TaskCostTableProps) => {
  const [editingCell, setEditingCell] = useState<{ taskId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

  // Group tasks by stage
  const groupedTasks = tasks.reduce((acc, task) => {
    const stage = task.stage || 'No Stage';
    if (!acc[stage]) {
      acc[stage] = [];
    }
    acc[stage].push(task);
    return acc;
  }, {} as Record<string, CentralTask[]>);

  const toggleStage = (stage: string) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stage)) {
      newExpanded.delete(stage);
    } else {
      newExpanded.add(stage);
    }
    setExpandedStages(newExpanded);
  };

  const handleCellClick = (taskId: string, field: string, currentValue: any) => {
    setEditingCell({ taskId, field });
    setEditValue(currentValue?.toString() || '');
  };

  const handleCellSave = async () => {
    if (!editingCell) return;
    
    try {
      const updates: TaskUpdate = {};
      if (editingCell.field === 'budgeted_cost') {
        updates.budgeted_cost = parseFloat(editValue) || 0;
      } else if (editingCell.field === 'actual_cost') {
        updates.actual_cost = parseFloat(editValue) || 0;
      }
      
      await onUpdateTask(editingCell.taskId, updates);
      setEditingCell(null);
      setEditValue('');
    } catch (error) {
      console.error('Failed to update task:', error);
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
  const getVarianceColor = (budgeted: number, actual: number) => {
    const variance = budgeted - actual;
    if (variance > 0) return 'text-green-600';
    if (variance < 0) return 'text-red-600';
  return 'text-muted-foreground';
  };

  // Extract numeric stage prefix (e.g., '4.0' from '4.0 PRELIMINARY')
  const extractStageNumber = (label: string): string => {
    if (!label) return '';
    const match = label.trim().match(/^([0-9]+(?:\.[0-9]+)*)/);
    return match ? match[1] : '';
  };

  return <div className="bg-card border rounded-xl overflow-hidden">
      {/* Table Header */}
      <div className="bg-muted/30 border-b px-6 py-3">
        <div className="flex items-center justify-end">
          
        </div>
      </div>

      {/* Airtable-style Table */}
      <div className="w-full">
        <table className="w-full">
          {/* Table Headers */}
          <thead className="bg-white/20 border-b border-white/20">
            <tr>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 border-r border-white/20" style={{
              minWidth: '60px'
            }}>
                No.
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 border-r border-white/20" style={{
              minWidth: '120px'
            }}>
                Stage
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 border-r border-white/20" style={{
              minWidth: '200px'
            }}>
                Activities
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 border-r border-white/20" style={{
              minWidth: '120px'
            }}>
                Cost Estimate
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 border-r border-white/20" style={{
              minWidth: '150px'
            }}>
                Notes
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
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-2 py-6 text-center text-muted-foreground">
                  <div className="flex flex-col items-center">
                    <p className="text-xs mb-2">No cost items found</p>
                    <Button size="sm" variant="outline" className="text-xs bg-white/20 border-white/30 text-foreground hover:bg-white/30">
                      + Add your first cost item
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              Object.entries(groupedTasks)
                .sort(([stageA], [stageB]) => stageA.localeCompare(stageB)) // Sort stages in ascending order
                .map(([stage, stageTasks]) => {
                const isExpanded = expandedStages.has(stage);
                const stageTotal = stageTasks.reduce((sum, task) => sum + (task.budgeted_cost || 0), 0);
                const stageActualTotal = stageTasks.reduce((sum, task) => sum + (task.actual_cost || 0), 0);

                return (
                  <React.Fragment key={stage}>
                    {/* Stage Parent Row */}
                    <tr 
                      className="bg-gray-100 border-b border-gray-200 hover:bg-gray-150 cursor-pointer transition-colors"
                      onClick={() => toggleStage(stage)}
                    >
                      <td className="px-2 py-2 text-xs font-semibold text-gray-900 border-r border-gray-200">
                        <div className="flex items-center">
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3 mr-1" />
                          ) : (
                            <ChevronRight className="w-3 h-3 mr-1" />
                          )}
                          {extractStageNumber(stage) || stageTasks.length}
                        </div>
                      </td>
                      <td colSpan={2} className="px-2 py-2 text-xs font-semibold text-gray-900 border-r border-gray-200">
                        {stage}
                      </td>
                      <td className="px-2 py-2 text-xs font-semibold text-gray-900 border-r border-gray-200 text-right">
                        {formatCurrency(stageTotal)}
                      </td>
                      <td className="px-2 py-2 border-r border-gray-200"></td>
                      <td className="px-2 py-2 text-xs font-semibold text-gray-900 border-r border-gray-200 text-right">
                        {formatCurrency(stageTotal)}
                      </td>
                      <td className="px-2 py-2 text-xs font-semibold text-gray-900 border-r border-gray-200 text-right">
                        {formatCurrency(stageActualTotal)}
                      </td>
                      <td className="px-2 py-2 text-xs font-semibold text-gray-900 border-r border-gray-200 text-right">
                        $0.00
                      </td>
                      <td className="px-2 py-2 text-xs font-semibold text-gray-900 text-right">
                        {formatCurrency(stageTotal)}
                      </td>
                    </tr>

                    {/* Child Task Rows */}
                    {isExpanded && stageTasks.map((task, taskIndex) => {
                      const budgeted = task.budgeted_cost || 0;
                      const actual = task.actual_cost || 0;
                      const isEditingBudgeted = editingCell?.taskId === task.id && editingCell?.field === 'budgeted_cost';
                      const isEditingActual = editingCell?.taskId === task.id && editingCell?.field === 'actual_cost';
                      
                      return (
                        <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
                          {/* No. */}
                          <td className="px-4 py-1 text-xs text-gray-600 border-r border-gray-100">
                            {extractStageNumber(stage) ? `${extractStageNumber(stage)}.${taskIndex + 1}` : taskIndex + 1}
                          </td>

                          {/* Stage - Empty for child rows */}
                          <td className="px-2 py-1 border-r border-gray-100">
                          </td>

                          {/* Activities (Task Name) */}
                          <td className="px-2 py-1 text-xs text-gray-900 border-r border-gray-100 max-w-xs">
                            <div className="truncate" title={task.name}>
                              {task.name}
                            </div>
                          </td>

                          {/* Cost Estimate */}
                          <td 
                            className="px-2 py-1 text-xs text-gray-900 border-r border-gray-100 cursor-pointer hover:bg-blue-50 text-right"
                            onClick={() => handleCellClick(task.id, 'budgeted_cost', budgeted)}
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

                          {/* Notes */}
                          <td className="px-2 py-1 text-xs text-gray-500 border-r border-gray-100">
                            {task.description || '-'}
                          </td>

                          {/* Project Budget */}
                          <td className="px-2 py-1 text-xs text-gray-900 border-r border-gray-100 text-right">
                            <span className="text-xs">{formatCurrency(budgeted)}</span>
                          </td>

                          {/* Cost Committed */}
                          <td 
                            className="px-2 py-1 text-xs text-gray-900 border-r border-gray-100 cursor-pointer hover:bg-blue-50 text-right"
                            onClick={() => handleCellClick(task.id, 'actual_cost', actual)}
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
                          <td className="px-2 py-1 text-xs text-gray-900 border-r border-gray-100 text-right">
                            <span className="text-xs">$0.00</span>
                          </td>

                          {/* Cost */}
                          <td className="px-2 py-1 text-xs text-gray-900 text-right">
                            <span className="text-xs">{formatCurrency(budgeted)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })
            )}
          </tbody>

          {/* Table Footer with Totals */}
          <tfoot className="bg-gray-50 border-t-2 border-gray-200">
            <tr>
              <td colSpan={3} className="px-2 py-1 text-xs font-medium text-gray-700 border-r border-gray-200">
                Total
              </td>
              <td className="px-2 py-1 text-xs font-bold text-gray-900 border-r border-gray-200 text-right">
                <span className="text-xs">
                  {formatCurrency(tasks.reduce((sum, task) => sum + (task.budgeted_cost || 0), 0))}
                </span>
              </td>
              <td className="border-r border-gray-200"></td>
              <td className="px-2 py-1 text-xs font-bold text-gray-900 border-r border-gray-200 text-right">
                <span className="text-xs">
                  {formatCurrency(tasks.reduce((sum, task) => sum + (task.budgeted_cost || 0), 0))}
                </span>
              </td>
              <td className="px-2 py-1 text-xs font-bold text-gray-900 border-r border-gray-200 text-right">
                <span className="text-xs">
                  {formatCurrency(tasks.reduce((sum, task) => sum + (task.actual_cost || 0), 0))}
                </span>
              </td>
              <td className="px-2 py-1 text-xs font-bold text-gray-900 border-r border-gray-200 text-right">
                <span className="text-xs">$0.00</span>
              </td>
              <td className="px-2 py-1 text-xs font-bold text-gray-900 text-right">
                <span className="text-xs">
                  {formatCurrency(tasks.reduce((sum, task) => sum + (task.budgeted_cost || 0), 0))}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>;
};