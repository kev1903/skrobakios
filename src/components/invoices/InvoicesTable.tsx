
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  ArrowUpDown,
  Eye,
  Edit,
  FileText,
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
  const [activeTab, setActiveTab] = useState<string>("all");
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
        .eq('type', 'ACCREC') // Filter for accounts receivable invoices only
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

  const filteredInvoices = invoices.filter(invoice => {
    // Search filter
    const matchesSearch = invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Tab filter
    let matchesTab = true;
    switch (activeTab) {
      case 'draft':
        matchesTab = invoice.status === 'DRAFT';
        break;
      case 'awaiting_approval':
        matchesTab = invoice.status === 'SUBMITTED';
        break;
      case 'awaiting_payment':
        matchesTab = invoice.status === 'AUTHORISED' || invoice.status === 'SENT';
        break;
      case 'paid':
        matchesTab = invoice.status === 'PAID';
        break;
      case 'repeating':
        matchesTab = invoice.type === 'ACCRECREPEAT';
        break;
      case 'all':
      default:
        matchesTab = true;
    }
    
    return matchesSearch && matchesTab;
  });

  // Calculate status counts
  const statusCounts = {
    all: invoices.length,
    draft: invoices.filter(i => i.status === 'DRAFT').length,
    awaiting_approval: invoices.filter(i => i.status === 'SUBMITTED').length,
    awaiting_payment: invoices.filter(i => i.status === 'AUTHORISED' || i.status === 'SENT').length,
    paid: invoices.filter(i => i.status === 'PAID').length,
    repeating: invoices.filter(i => i.type === 'ACCRECREPEAT').length,
  };

  // Calculate total amount due for filtered invoices
  const totalAmountDue = filteredInvoices.reduce((sum, invoice) => {
    return sum + (invoice.amount_due || 0);
  }, 0);

  const totalPaid = filteredInvoices.reduce((sum, invoice) => {
    return sum + ((invoice.total || 0) - (invoice.amount_due || 0));
  }, 0);

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
      case 'deleted':
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
      {/* Tab Filters */}
      <div className="border-b">
        <div className="flex items-center px-6 space-x-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'draft'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Draft <span className="text-xs">({statusCounts.draft})</span>
          </button>
          <button
            onClick={() => setActiveTab('awaiting_approval')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'awaiting_approval'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Awaiting Approval <span className="text-xs">({statusCounts.awaiting_approval})</span>
          </button>
          <button
            onClick={() => setActiveTab('awaiting_payment')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'awaiting_payment'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Awaiting Payment <span className="text-xs">({statusCounts.awaiting_payment})</span>
          </button>
          <button
            onClick={() => setActiveTab('paid')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'paid'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setActiveTab('repeating')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'repeating'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Repeating
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b flex items-center justify-end">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            {filteredInvoices.length} items
          </span>
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Ref</TableHead>
              <TableHead>To</TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="h-auto p-0 font-semibold">
                  Date
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  {invoices.length === 0 
                    ? "No invoices found. Connect to Xero and sync your data to see invoices here." 
                    : "No invoices match your search criteria."
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedInvoices.includes(invoice.id)}
                      onCheckedChange={(checked) => 
                        handleSelectInvoice(invoice.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <button 
                      onClick={() => navigate(`/invoice-details/${invoice.id}`)}
                      className="text-primary hover:underline font-medium"
                    >
                      {invoice.invoice_number || 'N/A'}
                    </button>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {invoice.reference || '—'}
                  </TableCell>
                  <TableCell>
                    <button 
                      className="text-primary hover:underline"
                    >
                      {invoice.contact_name || 'N/A'}
                    </button>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(invoice.date)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(invoice.due_date)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency((invoice.total || 0) - (invoice.amount_due || 0), invoice.currency_code)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(invoice.amount_due, invoice.currency_code)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(invoice.status)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {invoice.status === 'PAID' || invoice.status === 'SENT' ? (
                      <span className="text-green-600">Viewed</span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-popover">
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
      </div>

    </div>
  );
};
