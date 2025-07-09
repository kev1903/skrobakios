import { TableHead } from "@/components/ui/table";
import { ArrowUp, ArrowDown } from "lucide-react";
import { SortableHeaderProps } from "./types";

export const SortableTableHeader = ({ 
  field, 
  children, 
  sortField, 
  sortDirection, 
  onSort 
}: SortableHeaderProps) => (
  <TableHead 
    className="font-medium text-foreground cursor-pointer hover:bg-muted/50 select-none transition-colors duration-200 py-1"
    onClick={() => onSort(field)}
  >
    <div className="flex items-center space-x-1">
      <span className="text-sm">{children}</span>
      <div className="flex flex-col">
        <ArrowUp 
          className={`w-2.5 h-2.5 transition-colors duration-200 ${sortField === field && sortDirection === 'asc' ? 'text-primary' : 'text-muted-foreground'}`} 
        />
        <ArrowDown 
          className={`w-2.5 h-2.5 transition-colors duration-200 ${sortField === field && sortDirection === 'desc' ? 'text-primary' : 'text-muted-foreground'}`} 
        />
      </div>
    </div>
  </TableHead>
);