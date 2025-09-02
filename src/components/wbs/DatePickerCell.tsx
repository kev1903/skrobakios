import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerCellProps {
  id: string;
  type: 'phase' | 'component' | 'element';
  field: string;
  value?: string | Date | null;
  placeholder?: string;
  className?: string;
  onUpdate?: (id: string, field: string, value: string) => void;
  onCalculate?: (id: string, field: string, value: string, currentItem: any) => void;
  currentItem?: any;
}

export const DatePickerCell = ({
  id,
  type,
  field,
  value,
  placeholder = "Select date",
  className = "",
  onUpdate,
  onCalculate,
  currentItem
}: DatePickerCellProps) => {
  const [date, setDate] = useState<Date | undefined>(
    value ? (typeof value === 'string' ? new Date(value) : value) : undefined
  );
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Update local state when prop value changes (for auto-calculated dates)
  useEffect(() => {
    setDate(value ? (typeof value === 'string' ? new Date(value) : value) : undefined);
  }, [value]);
  
  // Only allow editing for elements (level 2)
  const isEditable = type === 'element';

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!isEditable) return;
    
    setDate(selectedDate);
    if (selectedDate) {
      // Store as YYYY-MM-DD to avoid timezone shifts
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      
      if (onUpdate) {
        onUpdate(id, field, dateString);
      }
      
      // Auto-calculate logic
      if (onCalculate && currentItem) {
        onCalculate(id, field, dateString, currentItem);
      }
    }
    setIsOpen(false);
  };

  const handleDateClear = () => {
    if (!isEditable) return;
    
    setDate(undefined);
    if (onUpdate) {
      onUpdate(id, field, '');
    }
    
    // Auto-calculate logic for clearing
    if (onCalculate && currentItem) {
      onCalculate(id, field, '', currentItem);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isEditable) return;
    
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      e.stopPropagation();
      handleDateClear();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(true);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditable) return;
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <div className="w-full h-full flex items-center">
      <Popover open={isOpen && isEditable} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={buttonRef}
            variant="ghost"
            disabled={!isEditable}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full justify-start text-left font-normal p-0 h-auto focus:ring-2 focus:ring-primary/20 focus:outline-none",
              isEditable ? "cursor-pointer hover:bg-accent/20" : "cursor-default opacity-60",
              !date && "text-muted-foreground",
              className
            )}
            tabIndex={isEditable ? 0 : -1}
            title={isEditable ? "Click to select date, or press Delete to clear" : "Auto-calculated"}
          >
            <div className="text-xs">
              {date ? (
                format(date, "MMM dd, yyyy")
              ) : (
                <span className="text-muted-foreground">
                  {isEditable ? placeholder : "Auto-calculated"}
                </span>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};