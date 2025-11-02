
import { Checkbox } from "@/components/ui/checkbox";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";

interface BillsTableHeaderProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: (checked: boolean) => void;
}

export const BillsTableHeader = ({ selectedCount, totalCount, onSelectAll }: BillsTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow className="h-9">
        <TableHead className="w-12 py-2">
          <Checkbox
            checked={selectedCount === totalCount}
            onCheckedChange={onSelectAll}
            className="h-3.5 w-3.5"
          />
        </TableHead>
        <TableHead className="py-2">
          <div className="flex items-center space-x-1">
            <span className="text-[10px] uppercase tracking-wider">Due date</span>
            <ArrowUpDown className="w-3 h-3" />
          </div>
        </TableHead>
        <TableHead className="py-2 text-[10px] uppercase tracking-wider">Vendor</TableHead>
        <TableHead className="py-2 text-[10px] uppercase tracking-wider">Bill number</TableHead>
        <TableHead className="py-2 text-[10px] uppercase tracking-wider">Project</TableHead>
        <TableHead className="py-2 text-right text-[10px] uppercase tracking-wider">Amount</TableHead>
        <TableHead className="py-2 text-[10px] uppercase tracking-wider">Status</TableHead>
        <TableHead className="min-w-[200px] py-2 text-[10px] uppercase tracking-wider">Linked Cash In Account</TableHead>
        <TableHead className="min-w-[200px] py-2 text-[10px] uppercase tracking-wider">To Pay</TableHead>
        <TableHead className="w-12 py-2"></TableHead>
      </TableRow>
    </TableHeader>
  );
};
