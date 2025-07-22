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
  MoreHorizontal,
  CheckSquare,
  Plus,
  ChevronRight,
  ChevronLeft
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
  onIndentClick?: () => void;
  onOutdentClick?: () => void;
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
  onMoreClick,
  onIndentClick,
  onOutdentClick
}: ToolbarProps) => {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 bg-white border-b border-gray-200",
      className
    )}>
      {/* Left side - Navigation tabs */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {}}
            className="h-8 px-3 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            title="List"
          >
            <span className="text-sm font-medium">List</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {}}
            className="h-8 px-3 text-blue-600 border-b-2 border-blue-600 rounded-none bg-transparent hover:bg-transparent"
            title="Gantt"
          >
            <span className="text-sm font-medium">Gantt</span>
          </Button>
        </div>
        
        {/* Indent/Outdent Controls */}
        <div className="flex items-center gap-1 border-l border-gray-200 pl-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOutdentClick}
            className="h-8 px-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            title="Outdent"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onIndentClick}
            className="h-8 px-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            title="Indent"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
          title="Add Task"
        >
          Add Task
        </Button>
      </div>
    </div>
  );
};