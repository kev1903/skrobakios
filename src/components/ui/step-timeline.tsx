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
      <ol className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 overflow-x-auto">
        {steps.map((step, idx) => {
          const stepIndex = idx + 1;
          const isCompleted = stepIndex < current;
          const isActive = stepIndex === current;
          return (
            <li key={step.id} className="flex items-center gap-3 whitespace-nowrap">
              {/* Node */}
              <button
                onClick={() => onChange?.(stepIndex)}
                className={cn(
                  'relative inline-flex items-center gap-2 rounded-full px-3 py-1.5 border transition-colors',
                  isActive && 'bg-primary text-primary-foreground border-transparent shadow-sm',
                  !isActive && 'bg-muted text-foreground border-border hover:bg-muted/70'
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold border',
                    isActive ? 'bg-primary-foreground/20 border-primary-foreground/30' : 'bg-background border-border'
                  )}
                >
                  {stepIndex}
                </span>
                <span className="text-sm font-medium">{step.title}</span>
              </button>

              {/* Connector */}
              {idx < steps.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    'h-px w-8 sm:w-12 lg:w-16',
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
