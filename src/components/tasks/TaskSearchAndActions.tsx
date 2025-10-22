
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Grid, List, Trash2, Archive, Plus, Download } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TaskSearchAndActionsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  selectedTasks: any[];
  onAddTask?: () => void;
  onExport?: () => void;
  onBulkDelete?: () => void;
  onBulkArchive?: () => void;
}

export const TaskSearchAndActions = ({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  selectedTasks,
  onAddTask,
  onExport,
  onBulkDelete,
  onBulkArchive
}: TaskSearchAndActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (onBulkDelete) {
      onBulkDelete();
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
    <div className="mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-white/60 border-white/30 text-slate-800 placeholder-slate-500"
            />
          </div>
          
          {/* Selected Tasks Badge */}
          {selectedTasks.length > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {selectedTasks.length} selected
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Add Task Button */}
          {onAddTask && (
            <Button 
              onClick={onAddTask}
              variant="default"
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          )}

          {/* Export Button */}
          {onExport && (
            <Button 
              onClick={onExport}
              variant="outline"
              size="sm"
              className="text-slate-700 hover:text-slate-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}

          {/* Bulk Actions */}
          {selectedTasks.length > 0 && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-slate-700 hover:text-slate-800"
                onClick={onBulkArchive}
                disabled={!onBulkArchive}
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:text-red-700"
                onClick={handleDeleteClick}
                disabled={!onBulkDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}

          {/* View Mode Toggle */}
          <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white/60">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className={`px-3 py-1 ${viewMode === "list" ? "bg-slate-800 text-white" : "text-slate-600 hover:text-slate-800"}`}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className={`px-3 py-1 ${viewMode === "grid" ? "bg-slate-800 text-white" : "text-slate-600 hover:text-slate-800"}`}
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {selectedTasks.length} Task{selectedTasks.length > 1 ? 's' : ''}?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {selectedTasks.length} selected task{selectedTasks.length > 1 ? 's' : ''}? 
            This action cannot be undone and will permanently remove {selectedTasks.length > 1 ? 'these tasks' : 'this task'} from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDeleteConfirm} 
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            Delete Task{selectedTasks.length > 1 ? 's' : ''}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};
