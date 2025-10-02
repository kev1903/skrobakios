import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { WBSPredecessor, DependencyType, WBSItem } from '@/types/wbs';
import { validateWBSTaskSchedule } from '@/utils/wbsPredecessorUtils';
import { toast } from 'sonner';

interface AvailableWBSItem {
  id: string;
  name: string;
  wbsNumber: string;
  level: number;
}

interface PredecessorCellProps {
  id: string;
  type: 'phase' | 'component' | 'element' | 'task';
  value?: WBSPredecessor[]; // Array of structured predecessors
  availableItems: AvailableWBSItem[];
  allItems?: WBSItem[]; // Full WBS items for validation
  className?: string;
  onUpdate?: (id: string, field: string, value: WBSPredecessor[]) => void;
}

export const PredecessorCell = ({
  id,
  type,
  value = [],
  availableItems,
  allItems = [],
  className = "",
  onUpdate
}: PredecessorCellProps) => {
  const [inputValue, setInputValue] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Only allow predecessors for elements
  const isElement = type === 'element';

  // Update input value when value prop changes
  useEffect(() => {
    if (value && value.length > 0) {
      // Convert predecessor IDs to WBS numbers for display
      const wbsNumbers = value
        .map(pred => {
          const item = availableItems.find(i => i.id === pred.id);
          return item?.wbsNumber;
        })
        .filter(Boolean)
        .join(', ');
      setInputValue(wbsNumbers);
    } else {
      setInputValue('');
    }
  }, [value, availableItems]);

  // Validate schedule when predecessors change
  useEffect(() => {
    if (isElement && allItems.length > 0 && value.length > 0) {
      const timeoutId = setTimeout(() => {
        const currentTask = allItems.find(t => t.id === id);
        if (currentTask) {
          const validation = validateWBSTaskSchedule(currentTask, allItems);
          setValidationErrors(validation.violations);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setValidationErrors([]);
    }
  }, [value, allItems, id, isElement]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    parsePredecessors();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      parsePredecessors();
      (e.target as HTMLInputElement).blur();
    }
  };

  const parsePredecessors = () => {
    if (!inputValue.trim()) {
      // Clear predecessors if input is empty
      if (onUpdate) {
        onUpdate(id, 'predecessors', []);
      }
      return;
    }

    // Parse comma-separated WBS numbers
    const wbsNumbers = inputValue.split(',').map(s => s.trim()).filter(Boolean);
    const predecessors: WBSPredecessor[] = [];
    const invalidNumbers: string[] = [];

    for (const wbsNumber of wbsNumbers) {
      // Find the item by WBS number
      const item = availableItems.find(i => i.wbsNumber === wbsNumber && i.level === 2);
      
      if (!item) {
        invalidNumbers.push(wbsNumber);
        continue;
      }

      // Don't allow self-reference
      if (item.id === id) {
        toast.error(`Cannot add task as its own predecessor`);
        continue;
      }

      // Add predecessor with default FS (Finish-to-Start) type
      predecessors.push({
        id: item.id,
        type: 'FS',
        lag: 0
      });
    }

    // Check element limit
    if (type === 'element' && predecessors.length > 1) {
      toast.error('Elements can only have 1 dependency');
      return;
    }

    // Show errors for invalid numbers
    if (invalidNumbers.length > 0) {
      toast.error(`Invalid WBS numbers: ${invalidNumbers.join(', ')}`);
      return;
    }

    // Update predecessors
    if (onUpdate) {
      onUpdate(id, 'predecessors', predecessors);
    }
  };

  // If not an element, show read-only display
  if (!isElement) {
    return (
      <div className="w-full h-full flex items-center">
        <div className={cn(
          "w-full text-left p-1 h-auto text-muted-foreground/50",
          className
        )}>
          <span className="text-xs">-</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center relative">
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
        placeholder="e.g., 1 or 1,2"
        className={cn(
          "h-6 text-xs border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-1",
          validationErrors.length > 0 && "text-destructive",
          className
        )}
      />
      {validationErrors.length > 0 && (
        <AlertTriangle className="absolute right-1 h-3 w-3 text-destructive pointer-events-none" />
      )}
    </div>
  );
};