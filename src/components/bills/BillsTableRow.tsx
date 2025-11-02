
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
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {bill.project || '-'}
        </span>
      </TableCell>
      <TableCell className="text-right font-medium">
        ${bill.amount}
      </TableCell>
      <TableCell>
        {onStatusChange ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs px-2 flex items-center gap-1"
              >
                {getStatusLabel(bill.status)}
                <ChevronDown className="h-3 w-3" />
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
          <Badge variant={getStatusBadgeVariant(bill.status)}>
            {getStatusLabel(bill.status)}
          </Badge>
        )}
      </TableCell>
      <TableCell className="min-w-[200px]">
        <Select
          value={bill.linkedCashInAccount || "none"}
          onValueChange={(value) => onAccountLinkChange(bill.id, value === "none" ? "" : value)}
        >
          <SelectTrigger className="w-full">
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
      <TableCell className="min-w-[200px]">
        <StakeholderCombobox
          value={bill.toPay || ""}
          onValueChange={(value) => onToPayChange(bill.id, value)}
        />
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
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
