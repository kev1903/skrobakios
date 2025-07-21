import React from 'react';
import { Grid2x2, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskViewToggleProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export const TaskViewToggle = ({ viewMode, onViewModeChange }: TaskViewToggleProps) => {
  return (
    <div className="flex items-center backdrop-blur-xl bg-card border border-border rounded-lg">
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("list")}
        className="text-foreground hover:bg-muted/50"
      >
        <LayoutList className="w-4 h-4 mr-2" />
        List
      </Button>
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("grid")}
        className="text-foreground hover:bg-muted/50"
      >
        <Grid2x2 className="w-4 h-4 mr-2" />
        Grid
      </Button>
    </div>
  );
};