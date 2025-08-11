import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Save, X } from 'lucide-react';
import { CentralTask, TaskUpdate } from '@/services/centralTaskService';
interface TaskCostTableProps {
  tasks: CentralTask[];
  onUpdateTask: (taskId: string, updates: TaskUpdate) => Promise<void>;
}
export const TaskCostTable = ({
  tasks,
  onUpdateTask
}: TaskCostTableProps) => {
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    budgeted_cost?: number;
    actual_cost?: number;
  }>({});
  const handleEdit = (task: CentralTask) => {
    setEditingTask(task.id);
    setEditValues({
      budgeted_cost: task.budgeted_cost || 0,
      actual_cost: task.actual_cost || 0
    });
  };
  const handleSave = async (taskId: string) => {
    try {
      await onUpdateTask(taskId, editValues);
      setEditingTask(null);
      setEditValues({});
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };
  const handleCancel = () => {
    setEditingTask(null);
    setEditValues({});
  };
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };
  const getVarianceColor = (budgeted: number, actual: number) => {
    const variance = budgeted - actual;
    if (variance > 0) return 'text-green-600';
    if (variance < 0) return 'text-red-600';
    return 'text-muted-foreground';
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
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 border-r border-white/20" style={{
              minWidth: '120px'
            }}>
                <div>Cost Estimate</div>
                <div className="font-mono text-sm font-bold text-foreground mt-1">
                  ${tasks.reduce((sum, task) => sum + (task.budgeted_cost || 0), 0).toLocaleString()}
                </div>
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 border-r border-white/20" style={{
              minWidth: '150px'
            }}>
                Notes
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 border-r border-white/20" style={{
              minWidth: '120px'
            }}>
                <div>Project Budget</div>
                <div className="font-mono text-sm font-bold text-foreground mt-1">
                  ${tasks.reduce((sum, task) => sum + (task.budgeted_cost || 0), 0).toLocaleString()}
                </div>
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 border-r border-white/20" style={{
              minWidth: '120px'
            }}>
                <div>Cost Committed</div>
                <div className="font-mono text-sm font-bold text-foreground mt-1">
                  ${tasks.reduce((sum, task) => sum + (task.actual_cost || 0), 0).toLocaleString()}
                </div>
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 border-r border-white/20" style={{
              minWidth: '120px'
            }}>
                <div>Paid to Date</div>
                <div className="font-mono text-sm font-bold text-foreground mt-1">
                  $0.00
                </div>
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3" style={{
              minWidth: '100px'
            }}>
                <div>Cost</div>
                <div className="font-mono text-sm font-bold text-foreground mt-1">
                  ${tasks.reduce((sum, task) => sum + (task.budgeted_cost || 0), 0).toLocaleString()}
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white/5">
            {tasks.length === 0 ? <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center">
                    <p className="text-sm mb-2">No cost items found</p>
                    <Button size="sm" variant="outline" className="text-xs bg-white/20 border-white/30 text-foreground hover:bg-white/30">
                      + Add your first cost item
                    </Button>
                  </div>
                </td>
              </tr> : tasks.map((task, index) => {
            const isEditing = editingTask === task.id;
            const budgeted = task.budgeted_cost || 0;
            const actual = task.actual_cost || 0;
            const variance = budgeted - actual;
            return <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    {/* No. */}
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-100">
                      {index + 1}
                    </td>

                    {/* Stage */}
                    <td className="px-4 py-3 border-r border-gray-100">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {task.stage}
                      </span>
                    </td>

                    {/* Activities (Task Name) */}
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-100 max-w-xs">
                      <div className="truncate font-medium" title={task.name}>
                        {task.name}
                      </div>
                    </td>

                    {/* Cost Estimate */}
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-100">
                      {isEditing ? <Input type="number" value={editValues.budgeted_cost || 0} onChange={e => setEditValues({
                  ...editValues,
                  budgeted_cost: parseFloat(e.target.value) || 0
                })} className="w-full text-sm border-gray-300 rounded-md" /> : <span className="font-mono">{formatCurrency(budgeted)}</span>}
                    </td>

                    {/* Notes */}
                    <td className="px-4 py-3 text-sm text-gray-500 border-r border-gray-100">
                      {task.description || '-'}
                    </td>

                    {/* Project Budget */}
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-100">
                      <span className="font-mono">{formatCurrency(budgeted)}</span>
                    </td>

                    {/* Cost Committed */}
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-100">
                      {isEditing ? <Input type="number" value={editValues.actual_cost || 0} onChange={e => setEditValues({
                  ...editValues,
                  actual_cost: parseFloat(e.target.value) || 0
                })} className="w-full text-sm border-gray-300 rounded-md" /> : <span className="font-mono">{formatCurrency(actual)}</span>}
                    </td>

                    {/* Paid to Date */}
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-100">
                      <span className="font-mono">$0.00</span>
                    </td>

                    {/* Cost / Actions */}
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? <div className="flex space-x-2">
                          <Button size="sm" onClick={() => handleSave(task.id)} className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700">
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel} className="h-7 px-2 text-xs">
                            <X className="h-3 w-3" />
                          </Button>
                        </div> : <Button size="sm" variant="ghost" onClick={() => handleEdit(task)} className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700">
                          <Edit2 className="h-3 w-3" />
                        </Button>}
                    </td>
                  </tr>;
          })}
          </tbody>

        </table>
      </div>
    </div>;
};