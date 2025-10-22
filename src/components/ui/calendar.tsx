import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  showActions?: boolean;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  showActions = false,
  ...props
}: CalendarProps) {
  return (
    <div className="bg-white rounded-xl border border-border/30 shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden">
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-4 pointer-events-auto", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-2 pb-4 relative items-center",
          caption_label: "text-base font-semibold text-foreground",
          nav: "flex items-center gap-1",
          nav_button: cn(
            "h-8 w-8 bg-transparent p-0 hover:bg-slate-100 rounded-lg transition-colors border-0"
          ),
          nav_button_previous: "absolute left-2",
          nav_button_next: "absolute right-2",
          table: "w-full border-collapse mt-2",
          head_row: "flex mb-2",
          head_cell:
            "text-muted-foreground/70 rounded-md w-10 font-semibold text-xs uppercase tracking-wide",
          row: "flex w-full mt-1",
          cell: cn(
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
            "h-10 w-10",
            "[&:has([aria-selected])]:bg-primary/5 first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg"
          ),
          day: cn(
            "h-10 w-10 p-0 font-medium rounded-lg hover:bg-slate-50 transition-colors",
            "aria-selected:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-lg font-semibold shadow-sm",
          day_today: "bg-slate-100 text-foreground font-semibold border border-primary/30",
          day_outside:
            "day-outside text-muted-foreground/40 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground/30 opacity-50 line-through",
          day_range_middle:
            "aria-selected:bg-primary/10 aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ ..._props }) => <ChevronUp className="h-4 w-4 text-foreground rotate-[-90deg]" />,
          IconRight: ({ ..._props }) => <ChevronDown className="h-4 w-4 text-foreground rotate-[-90deg]" />,
        }}
        {...props}
      />
      {showActions && (
        <div className="flex items-center justify-between px-4 pb-4 pt-2 border-t border-border/20">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary hover:bg-primary/10 font-medium"
          >
            Clear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary hover:bg-primary/10 font-medium"
          >
            Today
          </Button>
        </div>
      )}
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
