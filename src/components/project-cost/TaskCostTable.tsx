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

export const TaskCostTable = ({ tasks, onUpdateTask }: TaskCostTableProps) => {
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ budgeted_cost?: number; actual_cost?: number }>({});

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Cost Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Budgeted Cost</TableHead>
                <TableHead>Actual Cost</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const isEditing = editingTask === task.id;
                const budgeted = task.budgeted_cost || 0;
                const actual = task.actual_cost || 0;
                const variance = budgeted - actual;

                return (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium max-w-xs">
                      <div className="truncate" title={task.name}>
                        {task.name}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {task.stage}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editValues.budgeted_cost || 0}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            budgeted_cost: parseFloat(e.target.value) || 0
                          })}
                          className="w-32"
                        />
                      ) : (
                        formatCurrency(budgeted)
                      )}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editValues.actual_cost || 0}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            actual_cost: parseFloat(e.target.value) || 0
                          })}
                          className="w-32"
                        />
                      ) : (
                        formatCurrency(actual)
                      )}
                    </TableCell>

                    <TableCell>
                      <span className={getVarianceColor(
                        isEditing ? (editValues.budgeted_cost || 0) : budgeted,
                        isEditing ? (editValues.actual_cost || 0) : actual
                      )}>
                        {formatCurrency(
                          isEditing 
                            ? (editValues.budgeted_cost || 0) - (editValues.actual_cost || 0)
                            : variance
                        )}
                      </span>
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleSave(task.id)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(task)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No tasks found
          </div>
        )}
      </CardContent>
    </Card>
  );
};