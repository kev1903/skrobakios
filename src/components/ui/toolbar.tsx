import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  List, 
  Filter, 
  Settings, 
  Maximize2,
  BarChart3,
  Calendar,
  Users,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  className?: string;
  onBaselineClick?: () => void;
  onFilterClick?: () => void;
  onSettingsClick?: () => void;
  onExpandClick?: () => void;
  onChartClick?: () => void;
  onCalendarClick?: () => void;
  onUsersClick?: () => void;
  onMoreClick?: () => void;
}

export const Toolbar = ({
  className,
  onBaselineClick,
  onFilterClick,
  onSettingsClick,
  onExpandClick,
  onChartClick,
  onCalendarClick,
  onUsersClick,
  onMoreClick
}: ToolbarProps) => {
  return (
    <div className={cn(
      "flex items-center gap-1 p-2 bg-background border border-border rounded-lg glass-light backdrop-blur-sm",
      className
    )}>
      {/* Baselines */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBaselineClick}
        className="h-8 px-3 text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors duration-200"
        title="Baselines"
      >
        <List className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">Baselines</span>
      </Button>

      {/* Separator */}
      <div className="w-px h-6 bg-border/50 mx-1" />

      {/* Chart View */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onChartClick}
        className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors duration-200"
        title="Chart View"
      >
        <BarChart3 className="w-4 h-4" />
      </Button>

      {/* Calendar */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onCalendarClick}
        className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors duration-200"
        title="Calendar"
      >
        <Calendar className="w-4 h-4" />
      </Button>

      {/* Users */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onUsersClick}
        className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors duration-200"
        title="Users"
      >
        <Users className="w-4 h-4" />
      </Button>

      {/* Separator */}
      <div className="w-px h-6 bg-border/50 mx-1" />

      {/* Filter */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onFilterClick}
        className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors duration-200"
        title="Filter"
      >
        <Filter className="w-4 h-4" />
      </Button>

      {/* Settings */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onSettingsClick}
        className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors duration-200"
        title="Settings"
      >
        <Settings className="w-4 h-4" />
      </Button>

      {/* Expand */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onExpandClick}
        className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors duration-200"
        title="Expand"
      >
        <Maximize2 className="w-4 h-4" />
      </Button>

      {/* More */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onMoreClick}
        className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors duration-200"
        title="More options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>
    </div>
  );
};