import React, { useState, useEffect } from 'react';
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

  return (
    <div className="w-full h-full flex items-center">
      <Popover open={isOpen && isEditable} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            disabled={!isEditable}
            className={cn(
              "w-full justify-start text-left font-normal p-0 h-auto",
              isEditable ? "" : "cursor-default opacity-60",
              !date && "text-muted-foreground",
              className
            )}
          >
            <div className="flex items-center gap-1 text-xs">
              {date ? (
                format(date, "MMM dd, yyyy")
              ) : (
                <span className="text-muted-foreground">
                  {isEditable ? placeholder : "Auto-calculated"}
                </span>
              )}
              {isEditable && <CalendarIcon className="h-3 w-3 opacity-50" />}
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