import React, { useState } from 'react';
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
}

export const DatePickerCell = ({
  id,
  type,
  field,
  value,
  placeholder = "Select date",
  className = "",
  onUpdate
}: DatePickerCellProps) => {
  const [date, setDate] = useState<Date | undefined>(
    value ? (typeof value === 'string' ? new Date(value) : value) : undefined
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate && onUpdate) {
      onUpdate(id, field, selectedDate.toISOString());
    }
    setIsOpen(false);
  };

  return (
    <div className="w-full h-full flex items-center">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-left font-normal p-0 h-auto hover:bg-accent/20",
              !date && "text-muted-foreground",
              className
            )}
          >
            <div className="flex items-center gap-1 text-xs">
              {date ? (
                format(date, "MMM dd, yyyy")
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
              <CalendarIcon className="h-3 w-3 opacity-50" />
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