
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

const invoiceData = [
  {
    id: "1",
    expectedDate: "27 May '25",
    originalDueDate: "27 May '25",
    invoiceNumber: "INV-0282",
    invoicedTo: "CourtScopes",
    amountExpected: "164.14",
    overdue: true,
    draft: true,
    hasWarning: true,
    includedInCashFlow: true,
  },
  {
    id: "2",
    expectedDate: "18 Jun '25",
    originalDueDate: "18 Jun '25",
    invoiceNumber: "INV-0290",
    invoicedTo: "Niranjith & Suresha Kumaraperu",
    amountExpected: "6,602.10",
    overdue: true,
    draft: true,
    hasWarning: true,
    includedInCashFlow: true,
  },
  {
    id: "3",
    expectedDate: "25 Jun '25",
    originalDueDate: "25 Jun '25",
    invoiceNumber: "INV-0295 | 36 Mole St, Brighton",
    invoicedTo: "Vertex Windows Pty Ltd",
    amountExpected: "495.00",
    overdue: true,
    draft: false,
    hasWarning: true,
    includedInCashFlow: true,
  },
  {
    id: "4",
    expectedDate: "25 Jun '25",
    originalDueDate: "25 Jun '25",
    invoiceNumber: "INV-0294",
    invoicedTo: "Patrick & Nomsa",
    amountExpected: "5,951.00",
    overdue: true,
    draft: true,
    hasWarning: true,
    includedInCashFlow: true,
  },
];

export const InvoicesTable = () => {
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(invoiceData.map(invoice => invoice.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleSelectInvoice = (invoiceId: string, checked: boolean) => {
    if (checked) {
      setSelectedInvoices([...selectedInvoices, invoiceId]);
    } else {
      setSelectedInvoices(selectedInvoices.filter(id => id !== invoiceId));
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
              <SelectItem value="send-reminder">Send Reminder</SelectItem>
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
            <Select defaultValue="oldest-expected">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oldest-expected">Oldest expected date</SelectItem>
                <SelectItem value="newest-expected">Newest expected date</SelectItem>
                <SelectItem value="amount-high">Amount (High to Low)</SelectItem>
                <SelectItem value="amount-low">Amount (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input
            placeholder="Search by invoice number or customer"
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
                checked={selectedInvoices.length === invoiceData.length}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>
              <div className="flex items-center space-x-1">
                <span>Expected date</span>
                <ArrowUpDown className="w-4 h-4" />
              </div>
            </TableHead>
            <TableHead>Original due date</TableHead>
            <TableHead>Invoice number</TableHead>
            <TableHead>Invoiced to</TableHead>
            <TableHead className="text-right">Amount expected</TableHead>
            <TableHead className="text-center">Include in cash flow</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoiceData.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>
                <Checkbox
                  checked={selectedInvoices.includes(invoice.id)}
                  onCheckedChange={(checked) => 
                    handleSelectInvoice(invoice.id, checked as boolean)
                  }
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span>{invoice.expectedDate}</span>
                  {invoice.hasWarning && (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              </TableCell>
              <TableCell>{invoice.originalDueDate}</TableCell>
              <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
              <TableCell>{invoice.invoicedTo}</TableCell>
              <TableCell className="text-right font-medium">
                {invoice.amountExpected}
              </TableCell>
              <TableCell className="text-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto"></div>
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
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            OVERDUE
          </Badge>
          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
            DRAFT
          </Badge>
        </div>
      </div>
    </div>
  );
};
