
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Filter, 
  MoreHorizontal, 
  AlertTriangle,
  ArrowUpDown
} from "lucide-react";

const billData = [
  {
    id: "1",
    dueDate: "15 Jan '25",
    vendor: "ABC Construction Supply",
    billNumber: "BILL-001",
    category: "Materials",
    amount: "2,450.00",
    overdue: true,
    hasWarning: true,
    includedInCashFlow: true,
  },
  {
    id: "2",
    dueDate: "20 Jan '25",
    vendor: "Metro Electric Services",
    billNumber: "BILL-002",
    category: "Services",
    amount: "1,250.00",
    overdue: false,
    hasWarning: false,
    includedInCashFlow: true,
  },
  {
    id: "3",
    dueDate: "25 Jan '25",
    vendor: "City Permits Office",
    billNumber: "BILL-003",
    category: "Permits",
    amount: "850.00",
    overdue: false,
    hasWarning: false,
    includedInCashFlow: true,
  },
  {
    id: "4",
    dueDate: "30 Jan '25",
    vendor: "Pacific Plumbing Co.",
    billNumber: "BILL-004",
    category: "Services",
    amount: "3,200.00",
    overdue: false,
    hasWarning: false,
    includedInCashFlow: true,
  },
];

export const BillsTable = () => {
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBills(billData.map(bill => bill.id));
    } else {
      setSelectedBills([]);
    }
  };

  const handleSelectBill = (billId: string, checked: boolean) => {
    if (checked) {
      setSelectedBills([...selectedBills, billId]);
    } else {
      setSelectedBills(selectedBills.filter(id => id !== billId));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Table Controls */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select defaultValue="batch-actions">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="batch-actions">Batch Actions</SelectItem>
              <SelectItem value="mark-paid">Mark as Paid</SelectItem>
              <SelectItem value="schedule-payment">Schedule Payment</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <Select defaultValue="oldest-due">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oldest-due">Oldest due date</SelectItem>
                <SelectItem value="newest-due">Newest due date</SelectItem>
                <SelectItem value="amount-high">Amount (High to Low)</SelectItem>
                <SelectItem value="amount-low">Amount (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input
            placeholder="Search by bill number or vendor"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-80"
          />
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedBills.length === billData.length}
                onCheckedChange={handleSelectAll}
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
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {billData.map((bill) => (
            <TableRow key={bill.id}>
              <TableCell>
                <Checkbox
                  checked={selectedBills.includes(bill.id)}
                  onCheckedChange={(checked) => 
                    handleSelectBill(bill.id, checked as boolean)
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
              <TableCell>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Status badges for reference */}
      <div className="p-4 border-t bg-gray-50 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Status indicators:</span>
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            OVERDUE
          </Badge>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-600 border-yellow-300">
            DUE SOON
          </Badge>
        </div>
      </div>
    </div>
  );
};
