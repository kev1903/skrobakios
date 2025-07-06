import React from 'react';
import { Grid2x2, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskViewToggleProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export const TaskViewToggle = ({ viewMode, onViewModeChange }: TaskViewToggleProps) => {
  return (
    <div className="flex items-center backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg">
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("list")}
        className="text-white hover:bg-white/20"
      >
        <LayoutList className="w-4 h-4 mr-2" />
        List
      </Button>
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("grid")}
        className="text-white hover:bg-white/20"
      >
        <Grid2x2 className="w-4 h-4 mr-2" />
        Grid
      </Button>
    </div>
  );
};