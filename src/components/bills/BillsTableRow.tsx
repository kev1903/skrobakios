
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, MoreHorizontal } from "lucide-react";

interface Bill {
  id: string;
  dueDate: string;
  vendor: string;
  billNumber: string;
  category: string;
  amount: string;
  overdue: boolean;
  hasWarning: boolean;
  includedInCashFlow: boolean;
  linkedCashInAccount: string;
}

interface BillsTableRowProps {
  bill: Bill;
  isSelected: boolean;
  onSelect: (billId: string, checked: boolean) => void;
  onAccountLinkChange: (billId: string, accountId: string) => void;
}

const cashInAccounts = [
  { id: "construction-revenue", name: "Construction Revenue" },
  { id: "consulting-revenue", name: "Consulting Revenue" },
  { id: "other-revenue", name: "Other Revenue" },
  { id: "returns-revenue", name: "Returns & Revenue" },
];

export const BillsTableRow = ({ bill, isSelected, onSelect, onAccountLinkChange }: BillsTableRowProps) => {
  return (
    <TableRow key={bill.id}>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => 
            onSelect(bill.id, checked as boolean)
          }
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <span>{bill.dueDate}</span>
          {bill.hasWarning && (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
        </div>
      </TableCell>
      <TableCell>{bill.vendor}</TableCell>
      <TableCell className="font-medium">{bill.billNumber}</TableCell>
      <TableCell>{bill.category}</TableCell>
      <TableCell className="text-right font-medium">
        ${bill.amount}
      </TableCell>
      <TableCell className="text-center">
        <div className="w-3 h-3 bg-red-500 rounded-full mx-auto"></div>
      </TableCell>
      <TableCell className="min-w-[200px]">
        <Select
          value={bill.linkedCashInAccount}
          onValueChange={(value) => onAccountLinkChange(bill.id, value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No account linked</SelectItem>
            {cashInAccounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
