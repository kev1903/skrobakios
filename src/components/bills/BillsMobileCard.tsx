import { Checkbox } from "@/components/ui/checkbox";
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
import { AlertTriangle, MoreVertical, Trash2, ChevronDown, StickyNote } from "lucide-react";
import { StakeholderCombobox } from "./StakeholderCombobox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BillNotesDialog } from "./BillNotesDialog";
import { useState } from "react";

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
  status?: 'draft' | 'approved' | 'paid' | 'voided';
}

interface BillsMobileCardProps {
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

export const BillsMobileCard = ({ 
  bill, 
  isSelected, 
  onSelect, 
  onAccountLinkChange, 
  onToPayChange, 
  onDelete,
  onStatusChange
}: BillsMobileCardProps) => {
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  
  const getStatusLabel = (status: string | undefined) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'approved':
        return 'Approved';
      case 'draft':
        return 'Draft';
      case 'voided':
        return 'Voided';
      default:
        return 'Draft';
    }
  };

  const getStatusBadgeVariant = (status: string | undefined): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'approved':
        return 'default';
      case 'voided':
        return 'destructive';
      case 'draft':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-border/30 rounded-2xl p-4 shadow-sm space-y-3">
      {/* Header with checkbox and actions */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(bill.id, checked as boolean)}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm text-foreground truncate">
                {bill.vendor}
              </h3>
              {bill.hasWarning && (
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Bill #{bill.billNumber}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
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
      </div>

      {/* Bill details */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">Due Date</span>
          <p className="font-medium mt-0.5">{bill.dueDate}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Amount</span>
          <p className="font-semibold mt-0.5 text-right">${bill.amount}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Status</span>
          <div className="mt-0.5">
            {onStatusChange ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs px-2 flex items-center gap-1 w-full justify-between"
                  >
                    {getStatusLabel(bill.status)}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-background border shadow-lg z-50">
                  <DropdownMenuItem onClick={() => onStatusChange(bill.id, 'draft')}>
                    Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(bill.id, 'approved')}>
                    Approved
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(bill.id, 'paid')}>
                    Paid
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(bill.id, 'voided')}>
                    Voided
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Badge variant={getStatusBadgeVariant(bill.status)}>
                {getStatusLabel(bill.status)}
              </Badge>
            )}
          </div>
        </div>
        {bill.project && (
          <div>
            <span className="text-muted-foreground">Project</span>
            <p className="font-medium mt-0.5">{bill.project}</p>
          </div>
        )}
      </div>

      {/* Account linking */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Linked Cash In Account</label>
        <Select
          value={bill.linkedCashInAccount || "none"}
          onValueChange={(value) => onAccountLinkChange(bill.id, value === "none" ? "" : value)}
        >
          <SelectTrigger className="w-full h-9 text-xs">
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
      </div>

      {/* Payer assignment */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">To Pay</label>
        <StakeholderCombobox
          value={bill.toPay || ""}
          onValueChange={(value) => onToPayChange(bill.id, value)}
        />
      </div>

      {/* Notes button */}
      <div className="pt-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center gap-2"
          onClick={() => setNotesDialogOpen(true)}
        >
          <StickyNote className="w-4 h-4" />
          View Notes
        </Button>
      </div>

      <BillNotesDialog
        isOpen={notesDialogOpen}
        onClose={() => setNotesDialogOpen(false)}
        billId={bill.id}
        billNumber={bill.billNumber}
      />
    </div>
  );
};
