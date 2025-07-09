
import { useState, useEffect } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Filter, 
  MoreHorizontal, 
  AlertTriangle,
  ArrowUpDown,
  Eye,
  Edit,
  FileText,
  Check
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface XeroInvoice {
  id: string;
  xero_invoice_id: string;
  invoice_number: string | null;
  contact_name: string | null;
  date: string | null;
  due_date: string | null;
  status: string | null;
  total: number | null;
  amount_due: number | null;
  currency_code: string | null;
  type: string | null;
  reference: string | null;
}
export const InvoicesTable = () => {
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [invoices, setInvoices] = useState<XeroInvoice[]>([]);
  const [allocatedInvoices, setAllocatedInvoices] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
    fetchAllocatedInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('xero_invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        toast({
          title: "Error",
          description: "Failed to fetch invoices from Xero",
          variant: "destructive",
        });
        return;
      }

      setInvoices(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error", 
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllocatedInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoice_allocations')
        .select('invoice_id');

      if (error) {
        console.error('Error fetching allocated invoices:', error);
        return;
      }

      const allocatedIds = new Set(data?.map(allocation => allocation.invoice_id) || []);
      setAllocatedInvoices(allocatedIds);
    } catch (error) {
      console.error('Error fetching allocated invoices:', error);
    }
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.contact_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(filteredInvoices.map(invoice => invoice.id));
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: '2-digit'
    });
  };

  const formatCurrency = (amount: number | null, currency: string | null = 'USD') => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    const statusLower = status.toLowerCase();
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    let className = "";

    switch (statusLower) {
      case 'paid':
        variant = "default";
        className = "bg-green-100 text-green-800 border-green-300";
        break;
      case 'draft':
        variant = "outline";
        className = "bg-gray-100 text-gray-600 border-gray-300";
        break;
      case 'authorised':
      case 'sent':
        variant = "outline";
        className = "bg-blue-100 text-blue-800 border-blue-300";
        break;
      case 'overdue':
        variant = "destructive";
        className = "bg-red-100 text-red-800 border-red-300";
        break;
      default:
        variant = "outline";
    }

    return (
      <Badge variant={variant} className={className}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const isOverdue = (dueDate: string | null, status: string | null) => {
    if (!dueDate || status?.toLowerCase() === 'paid') return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading invoices...</p>
      </div>
    );
  }

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
                checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>
              <div className="flex items-center space-x-1">
                <span>Invoice Date</span>
                <ArrowUpDown className="w-4 h-4" />
              </div>
            </TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Invoice Number</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Allocation</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Amount Due</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                {invoices.length === 0 
                  ? "No invoices found. Connect to Xero and sync your data to see invoices here." 
                  : "No invoices match your search criteria."
                }
              </TableCell>
            </TableRow>
          ) : (
            filteredInvoices.map((invoice) => (
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
                    <span>{formatDate(invoice.date)}</span>
                    {isOverdue(invoice.due_date, invoice.status) && (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span>{formatDate(invoice.due_date)}</span>
                    {isOverdue(invoice.due_date, invoice.status) && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                        OVERDUE
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {invoice.invoice_number || 'N/A'}
                  {invoice.reference && (
                    <div className="text-xs text-gray-500 mt-1">{invoice.reference}</div>
                  )}
                </TableCell>
                <TableCell>{invoice.contact_name || 'N/A'}</TableCell>
                <TableCell>
                  {getStatusBadge(invoice.status)}
                </TableCell>
                <TableCell className="text-center">
                  {allocatedInvoices.has(invoice.id) && (
                    <Check className="w-5 h-5 text-green-600 mx-auto" />
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(invoice.total, invoice.currency_code)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(invoice.amount_due, invoice.currency_code)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        onClick={() => navigate(`/invoice-details/${invoice.id}`)}
                        className="flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center space-x-2">
                        <Edit className="w-4 h-4" />
                        <span>Edit Invoice</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>Download PDF</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Summary Footer */}
      <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Status indicators:</span>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              PAID
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
              SENT
            </Badge>
            <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
              DRAFT
            </Badge>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              OVERDUE
            </Badge>
          </div>
        </div>
        {filteredInvoices.length > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              fetchInvoices();
              fetchAllocatedInvoices();
            }}
            className="flex items-center space-x-2"
          >
            <span>Refresh</span>
          </Button>
        )}
      </div>
    </div>
  );
};
