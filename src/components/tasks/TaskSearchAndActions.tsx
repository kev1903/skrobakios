import React from 'react';
import { Download, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskViewToggle } from './TaskViewToggle';

interface TaskSearchAndActionsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export const TaskSearchAndActions = ({ 
  searchTerm, 
  onSearchChange, 
  viewMode, 
  onViewModeChange 
}: TaskSearchAndActionsProps) => {
  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-80 backdrop-blur-xl bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <TaskViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
          <Button variant="outline" className="backdrop-blur-xl bg-card border-border text-foreground hover:bg-muted">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" className="backdrop-blur-xl bg-card border-border text-foreground hover:bg-muted">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>
    </div>
  );
};