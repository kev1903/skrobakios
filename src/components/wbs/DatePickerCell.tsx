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
  type: 'phase' | 'component' | 'element' | 'task';
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
  
  // In flat structure, all items are editable
  const isEditable = true;

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
      // Pass null instead of empty string for database compatibility
      onUpdate(id, field, null as any);
    }
    
    // Auto-calculate logic for clearing
    if (onCalculate && currentItem) {
      onCalculate(id, field, null as any, currentItem);
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
              "w-full justify-start text-left font-normal p-1 h-auto focus:ring-2 focus:ring-blue-500/20 focus:outline-none hover:bg-slate-100 transition-colors",
              isEditable ? "cursor-pointer" : "cursor-default opacity-60",
              !date && "text-slate-400",
              className
            )}
            tabIndex={isEditable ? 0 : -1}
            title="Click to select date, or press Delete to clear"
          >
            <div className="text-xs font-medium text-slate-700">
              {date ? (
                format(date, "MMM dd, yyyy")
              ) : (
                <span className="text-slate-400 font-normal">
                  {placeholder}
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
          <div className="p-3 pt-0 border-t border-border/30">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDateClear();
                setIsOpen(false);
              }}
            >
              Clear Date
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};