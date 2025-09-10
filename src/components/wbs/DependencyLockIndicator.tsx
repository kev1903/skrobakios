import React from 'react';
import { Lock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { WBSItem } from '@/types/wbs';

interface DependencyLockIndicatorProps {
  item: WBSItem;
  field: 'start_date' | 'end_date';
  className?: string;
}

export const DependencyLockIndicator: React.FC<DependencyLockIndicatorProps> = ({
  item,
  field,
  className
}) => {
  // Check if this field is locked by dependencies
  const hasFinishToStartDeps = item.predecessors?.some(p => p.type === 'FS');
  const isStartDateLocked = field === 'start_date' && hasFinishToStartDeps;
  const hasStartToStartDeps = item.predecessors?.some(p => p.type === 'SS');
  const isStartLockedBySSOrFS = field === 'start_date' && (hasFinishToStartDeps || hasStartToStartDeps);
  
  const hasFinishToFinishDeps = item.predecessors?.some(p => p.type === 'FF');
  const isEndDateLocked = field === 'end_date' && hasFinishToFinishDeps;

  const isLocked = isStartLockedBySSOrFS || isEndDateLocked;

  if (!isLocked) return null;

  const getDependencyText = () => {
    if (field === 'start_date') {
      if (hasFinishToStartDeps) {
        return 'Start date locked by Finish-to-Start dependency';
      }
      if (hasStartToStartDeps) {
        return 'Start date constrained by Start-to-Start dependency';
      }
    }
    if (field === 'end_date' && hasFinishToFinishDeps) {
      return 'End date constrained by Finish-to-Finish dependency';
    }
    return 'Date constrained by dependencies';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            'inline-flex items-center ml-1 opacity-60 hover:opacity-100 transition-opacity',
            className
          )}>
            {isStartDateLocked ? (
              <Lock className="w-3 h-3 text-amber-600" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-blue-600" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs">{getDependencyText()}</p>
          {item.predecessors && (
            <div className="mt-1 text-xs text-muted-foreground">
              Dependencies: {item.predecessors.map(p => `${p.type}${p.lag ? ` (+${p.lag}d)` : ''}`).join(', ')}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};