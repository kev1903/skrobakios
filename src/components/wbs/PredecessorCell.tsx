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

  // Update input value when value prop changes
  useEffect(() => {
    if (value && value.length > 0) {
      // Convert predecessor IDs to WBS numbers for display (remove trailing .0)
      const wbsNumbers = value
        .map(pred => {
          const item = availableItems.find(i => i.id === pred.id);
          if (!item?.wbsNumber) return null;
          // Remove trailing .0 from WBS numbers
          return item.wbsNumber.replace(/\.0$/, '');
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
    if (allItems.length > 0 && value.length > 0) {
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
  }, [value, allItems, id]);

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

    console.log('🔍 Parsing predecessors:', wbsNumbers);
    console.log('📋 Available items:', availableItems.map(i => ({ id: i.id, wbsNumber: i.wbsNumber, name: i.name })));

    for (const wbsNumber of wbsNumbers) {
      // Find the item by WBS number - support both exact match and partial match (e.g., "2" matches "2.0")
      const item = availableItems.find(i => 
        i.wbsNumber === wbsNumber || 
        i.wbsNumber === `${wbsNumber}.0` ||
        i.wbsNumber.startsWith(`${wbsNumber}.`)
      );
      
      console.log(`🔍 Looking for WBS number "${wbsNumber}":`, item);
      
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

  return (
    <div className="w-full h-full flex items-center relative">
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
        placeholder=""
        className={cn(
          "h-full text-xs border-0 shadow-none px-2 bg-transparent cursor-text",
          "hover:bg-accent/30 focus:bg-accent/50",
          "focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
          "transition-colors duration-150",
          validationErrors.length > 0 && "text-destructive",
          className
        )}
      />
      {validationErrors.length > 0 && (
        <AlertTriangle className="absolute right-2 h-3 w-3 text-destructive pointer-events-none" />
      )}
    </div>
  );
};