
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
      <TableRow>
        <TableHead className="w-12">
          <Checkbox
            checked={selectedCount === totalCount}
            onCheckedChange={onSelectAll}
          />
        </TableHead>
        <TableHead>
          <div className="flex items-center space-x-1">
            <span>Due date</span>
            <ArrowUpDown className="w-4 h-4" />
          </div>
        </TableHead>
        <TableHead>Vendor</TableHead>
        <TableHead>Bill number</TableHead>
        <TableHead>Category</TableHead>
        <TableHead className="text-right">Amount</TableHead>
        <TableHead className="text-center">Include in cash flow</TableHead>
        <TableHead className="min-w-[200px]">Linked Cash In Account</TableHead>
        <TableHead className="w-12"></TableHead>
      </TableRow>
    </TableHeader>
  );
};
