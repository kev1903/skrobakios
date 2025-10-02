import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import { WBSPredecessor, DependencyType } from '@/types/wbs';

interface AvailableWBSItem {
  id: string;
  wbs_id: string;
  title: string;
}

interface PredecessorRow extends WBSPredecessor {
  tempId: string;
}

interface PredecessorEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentItem: {
    id: string;
    wbs_id: string;
    title: string;
  };
  predecessors: WBSPredecessor[];
  availableItems: AvailableWBSItem[];
  onSave: (predecessors: WBSPredecessor[]) => void;
}

const dependencyTypes: DependencyType[] = ['FS', 'SS', 'FF', 'SF'];
const dependencyTypeLabels: Record<DependencyType, string> = {
  FS: 'Finish-to-Start (FS)',
  SS: 'Start-to-Start (SS)',
  FF: 'Finish-to-Finish (FF)',
  SF: 'Start-to-Finish (SF)',
};

export const PredecessorEditDialog: React.FC<PredecessorEditDialogProps> = ({
  open,
  onOpenChange,
  currentItem,
  predecessors,
  availableItems,
  onSave,
}) => {
  const [rows, setRows] = useState<PredecessorRow[]>([]);

  useEffect(() => {
    if (open) {
      // Initialize rows with existing predecessors plus one empty row
      const initialRows: PredecessorRow[] = predecessors.map((pred, idx) => ({
        ...pred,
        tempId: `existing-${idx}`,
      }));
      initialRows.push({
        id: '',
        type: 'FS',
        lag: 0,
        tempId: `new-${Date.now()}`,
      });
      setRows(initialRows);
    }
  }, [open, predecessors]);

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        id: '',
        type: 'FS',
        lag: 0,
        tempId: `new-${Date.now()}`,
      },
    ]);
  };

  const handleRemoveRow = (tempId: string) => {
    setRows(rows.filter((row) => row.tempId !== tempId));
  };

  const handleUpdateRow = (
    tempId: string,
    field: keyof WBSPredecessor,
    value: string | number
  ) => {
    setRows(
      rows.map((row) =>
        row.tempId === tempId ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSave = () => {
    // Filter out empty rows and convert to WBSPredecessor[]
    const validPredecessors = rows
      .filter((row) => row.id)
      .map(({ tempId, ...pred }) => pred);
    onSave(validPredecessors);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const getTaskByWBSId = (wbsId: string) => {
    return availableItems.find((item) => item.wbs_id === wbsId);
  };

  const getTaskById = (id: string) => {
    return availableItems.find((item) => item.id === id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Predecessors</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Row {currentItem.wbs_id}: {currentItem.title}
          </p>

          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-[80px_1fr_200px_100px_40px] gap-2 p-3 bg-muted/50 font-medium text-sm">
              <div>Row #</div>
              <div>Task</div>
              <div>Type</div>
              <div>Lag</div>
              <div></div>
            </div>

            <div className="divide-y">
              {rows.map((row, index) => {
                const selectedTask = getTaskById(row.id);
                return (
                  <div
                    key={row.tempId}
                    className="grid grid-cols-[80px_1fr_200px_100px_40px] gap-2 p-3 items-center"
                  >
                    <Input
                      value={selectedTask?.wbs_id || ''}
                      onChange={(e) => {
                        const task = getTaskByWBSId(e.target.value);
                        if (task) {
                          handleUpdateRow(row.tempId, 'id', task.id);
                        }
                      }}
                      placeholder="Row #"
                      className="h-9"
                    />

                    <Select
                      value={row.id}
                      onValueChange={(value) =>
                        handleUpdateRow(row.tempId, 'id', value)
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select task" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.wbs_id} - {item.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={row.type}
                      onValueChange={(value) =>
                        handleUpdateRow(row.tempId, 'type', value)
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dependencyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {dependencyTypeLabels[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      value={row.lag || 0}
                      onChange={(e) =>
                        handleUpdateRow(
                          row.tempId,
                          'lag',
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      className="h-9"
                    />

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRow(row.tempId)}
                      className="h-9 w-9"
                      disabled={rows.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleAddRow}
            className="w-full"
          >
            Add Predecessor
          </Button>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
