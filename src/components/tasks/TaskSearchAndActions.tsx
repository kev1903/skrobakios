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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-80 backdrop-blur-xl bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <TaskViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
          <Button variant="outline" className="backdrop-blur-xl bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" className="backdrop-blur-xl bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>
    </div>
  );
};