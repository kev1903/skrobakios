
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertTriangle, MoreHorizontal, Trash2, ChevronDown } from "lucide-react";
import { StakeholderCombobox } from "./StakeholderCombobox";
import { Badge } from "@/components/ui/badge";

interface Bill {
  id: string;
  dueDate: string;
  vendor: string;
  billNumber: string;
  project?: string;
  amount: string;
  overdue: boolean;
  hasWarning: boolean;
  linkedCashInAccount: string;
  toPay?: string;
  status?: 'draft' | 'submitted' | 'scheduled' | 'approved' | 'paid' | 'cancelled';
}

interface BillsTableRowProps {
  bill: Bill;
  isSelected: boolean;
  onSelect: (billId: string, checked: boolean) => void;
  onAccountLinkChange: (billId: string, accountId: string) => void;
  onToPayChange: (billId: string, toPay: string) => void;
  onDelete: (billId: string) => void;
  onStatusChange?: (billId: string, status: string) => void;
}

const cashInAccounts = [
  { id: "construction-revenue", name: "Construction Revenue" },
  { id: "consulting-revenue", name: "Consulting Revenue" },
  { id: "other-revenue", name: "Other Revenue" },
  { id: "returns-revenue", name: "Returns & Revenue" },
];

export const BillsTableRow = ({ bill, isSelected, onSelect, onAccountLinkChange, onToPayChange, onDelete, onStatusChange }: BillsTableRowProps) => {
  const getStatusLabel = (status: string | undefined) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'approved':
        return 'Approved';
      case 'submitted':
        return 'Pending';
      case 'scheduled':
        return 'Scheduled';
      case 'draft':
        return 'Draft';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  };

  const getStatusBadgeVariant = (status: string | undefined): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'approved':
        return 'default';
      case 'submitted':
        return 'secondary';
      case 'scheduled':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <TableRow key={bill.id} className="h-10">
      <TableCell className="py-1.5">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => 
            onSelect(bill.id, checked as boolean)
          }
          className="h-3.5 w-3.5"
        />
      </TableCell>
      <TableCell className="py-1.5">
        <div className="flex items-center space-x-1.5">
          <span className="text-xs">{bill.dueDate}</span>
          {bill.hasWarning && (
            <AlertTriangle className="w-3 h-3 text-red-500" />
          )}
        </div>
      </TableCell>
      <TableCell className="py-1.5 text-xs">{bill.vendor}</TableCell>
      <TableCell className="py-1.5 text-xs font-medium">{bill.billNumber}</TableCell>
      <TableCell className="py-1.5">
        <span className="text-xs text-muted-foreground">
          {bill.project || '-'}
        </span>
      </TableCell>
      <TableCell className="py-1.5 text-right text-xs font-medium">
        ${bill.amount}
      </TableCell>
      <TableCell className="py-1.5">
        {onStatusChange ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 text-[10px] px-1.5 flex items-center gap-0.5"
              >
                {getStatusLabel(bill.status)}
                <ChevronDown className="h-2.5 w-2.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onStatusChange(bill.id, 'draft')}>
                Draft
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(bill.id, 'submitted')}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(bill.id, 'approved')}>
                Approved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(bill.id, 'scheduled')}>
                Scheduled
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(bill.id, 'paid')}>
                Paid
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(bill.id, 'cancelled')}>
                Cancelled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Badge variant={getStatusBadgeVariant(bill.status)} className="text-[10px] h-5 px-1.5">
            {getStatusLabel(bill.status)}
          </Badge>
        )}
      </TableCell>
      <TableCell className="min-w-[200px] py-1.5">
        <Select
          value={bill.linkedCashInAccount || "none"}
          onValueChange={(value) => onAccountLinkChange(bill.id, value === "none" ? "" : value)}
        >
          <SelectTrigger className="w-full h-7 text-xs">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No account linked</SelectItem>
            {cashInAccounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="min-w-[200px] py-1.5">
        <StakeholderCombobox
          value={bill.toPay || ""}
          onValueChange={(value) => onToPayChange(bill.id, value)}
        />
      </TableCell>
      <TableCell className="py-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(bill.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
