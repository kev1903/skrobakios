import React from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Calendar, TrendingUp, GitBranch } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface TimeViewHeaderProps {
  projectProgress: number;
  showCriticalPath: boolean;
  showBaseline: boolean;
  onToggleCriticalPath: () => void;
  onToggleBaseline: () => void;
  viewMode: 'day' | 'week' | 'month';
  onViewModeChange: (mode: 'day' | 'week' | 'month') => void;
}

export const TimeViewHeader = ({
  projectProgress,
  showCriticalPath,
  showBaseline,
  onToggleCriticalPath,
  onToggleBaseline,
  viewMode,
  onViewModeChange
}: TimeViewHeaderProps) => {
  return (
    <div className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
      {/* Left Section - Progress Indicator */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Timeline Progress
            </span>
            <span className="text-sm font-bold text-slate-900">
              {projectProgress}%
            </span>
          </div>
          <Progress value={projectProgress} className="h-2 w-48" />
        </div>
      </div>

      {/* Right Section - View Controls */}
      <div className="flex items-center gap-4">
        {/* Critical Path Toggle */}
        <Button
          variant={showCriticalPath ? "default" : "outline"}
          size="sm"
          onClick={onToggleCriticalPath}
          className="h-8 gap-2 text-xs font-medium"
        >
          <GitBranch className="h-3 w-3" />
          Critical Path
        </Button>

        {/* Baseline Toggle */}
        <Button
          variant={showBaseline ? "default" : "outline"}
          size="sm"
          onClick={onToggleBaseline}
          className="h-8 gap-2 text-xs font-medium"
        >
          <TrendingUp className="h-3 w-3" />
          Baseline
        </Button>

        {/* View Mode Toggle */}
        <div className="h-6 w-px bg-slate-200" />
        <ToggleGroup 
          type="single" 
          value={viewMode}
          onValueChange={(value) => value && onViewModeChange(value as 'day' | 'week' | 'month')}
          className="border border-slate-200 rounded-md"
        >
          <ToggleGroupItem value="day" className="h-8 px-3 text-xs data-[state=on]:bg-slate-900 data-[state=on]:text-white">
            Day
          </ToggleGroupItem>
          <ToggleGroupItem value="week" className="h-8 px-3 text-xs data-[state=on]:bg-slate-900 data-[state=on]:text-white">
            Week
          </ToggleGroupItem>
          <ToggleGroupItem value="month" className="h-8 px-3 text-xs data-[state=on]:bg-slate-900 data-[state=on]:text-white">
            Month
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
};
