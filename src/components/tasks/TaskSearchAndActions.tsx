
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Grid, List, Trash2, Archive, Plus, Download } from 'lucide-react';

interface TaskSearchAndActionsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  selectedTasks: any[];
  onAddTask?: () => void;
  onExport?: () => void;
}

export const TaskSearchAndActions = ({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  selectedTasks,
  onAddTask,
  onExport
}: TaskSearchAndActionsProps) => {
  return (
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
              <Button variant="outline" size="sm" className="text-slate-700 hover:text-slate-800">
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
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
  );
};
