import React from 'react';
import { cn } from '@/lib/utils';

export type StepItem = {
  id: number;
  title: string;
  subtitle?: string;
};

interface StepTimelineProps {
  steps: StepItem[];
  current: number; // 1-indexed
  onChange?: (step: number) => void;
  className?: string;
}

export const StepTimeline: React.FC<StepTimelineProps> = ({ steps, current, onChange, className }) => {
  return (
    <nav
      aria-label="Estimation steps"
      className={cn(
        'w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70',
        className
      )}
    >
      <ol className="w-full px-3 sm:px-4 lg:px-6 py-2 flex items-center gap-2 overflow-hidden">
        {steps.map((step, idx) => {
          const stepIndex = idx + 1;
          const isCompleted = stepIndex < current;
          const isActive = stepIndex === current;
          return (
            <li key={step.id} className="flex items-center gap-2 min-w-0 flex-1">
              {/* Node */}
              <button
                onClick={() => onChange?.(stepIndex)}
                className={cn(
                  'relative inline-flex items-center gap-1.5 rounded-full px-2 py-1 border transition-colors shrink-0',
                  isActive && 'bg-primary text-primary-foreground border-transparent shadow-sm',
                  !isActive && 'bg-muted text-foreground border-border hover:bg-muted/70'
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-full text-xs font-semibold border',
                    isActive ? 'bg-primary-foreground/20 border-primary-foreground/30' : 'bg-background border-border'
                  )}
                >
                  {stepIndex}
                </span>
                <span className="text-xs font-medium truncate">{step.title}</span>
              </button>

              {/* Connector */}
              {idx < steps.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    'h-px flex-1',
                    isCompleted ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default StepTimeline;
