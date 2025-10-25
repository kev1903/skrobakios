import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Plus, Trash2, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Invoice {
  id: string;
  number: string;
  client_name: string;
  issue_date: string;
  due_date: string;
  status: string;
  total: number;
  paid_to_date: number;
  contract_id?: string;
  contract_name?: string;
  milestone_stage?: string;
  notes?: string;
  created_at: string;
}

interface IncomeTableProps {
  projectId: string;
  statusFilter: string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  refreshTrigger: number;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'paid':
      return 'default';
    case 'sent':
      return 'secondary';
    case 'draft':
      return 'outline';
    case 'overdue':
      return 'destructive';
    case 'part_paid':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'paid':
      return 'Paid';
    case 'sent':
      return 'Sent';
    case 'draft':
      return 'Draft';
    case 'overdue':
      return 'Overdue';
    case 'part_paid':
      return 'Part Paid';
    default:
      return status;
  }
};

export const IncomeTable = ({ 
  projectId, 
  statusFilter, 
  formatCurrency, 
  formatDate,
  refreshTrigger 
}: IncomeTableProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadInvoices = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('invoices')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as any);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading invoices:', error);
        return;
      }

      // Fetch contract names for invoices that have contract_id
      const invoicesWithContracts = await Promise.all(
        (data || []).map(async (invoice) => {
          if (invoice.contract_id) {
            const { data: contract } = await supabase
              .from('project_contracts')
              .select('name')
              .eq('id', invoice.contract_id)
              .maybeSingle();
            
            return {
              ...invoice,
              contract_name: contract?.name || 'Unknown Contract'
            };
          }
          return invoice;
        })
      );

      setInvoices(invoicesWithContracts);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (invoiceId: string, total: number, currentStatus: string) => {
    try {
      // Toggle between paid and draft status
      const newStatus = currentStatus === 'paid' ? 'draft' : 'paid';
      const newPaidAmount = newStatus === 'paid' ? total : 0;
      
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: newStatus, 
          paid_to_date: newPaidAmount 
        })
        .eq('id', invoiceId);

      if (error) {
        console.error('Error updating invoice status:', error);
        toast({
          title: "Error",
          description: "Failed to update invoice status. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: newStatus === 'paid' 
          ? "Invoice marked as paid successfully." 
          : "Invoice status updated to unpaid.",
      });
      
      loadInvoices();
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast({
        title: "Error",
        description: "Failed to update invoice status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }

    try {
      // Use RPC function to delete invoice with proper permissions
      const { data, error } = await supabase.rpc('delete_invoice_with_items', {
        invoice_id_param: invoiceId
      });

      if (error) {
        console.error('Error deleting invoice:', error);
        toast({
          title: "Error",
          description: `Failed to delete invoice: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      // Check the response
      const response = data as { success: boolean; error?: string; message?: string } | null;
      
      if (response && !response.success) {
        toast({
          title: "Error",
          description: response.error || "Failed to delete invoice.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Invoice deleted successfully.",
      });
      
      loadInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "Error",
        description: "Failed to delete invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [projectId, statusFilter, refreshTrigger]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Eye className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Invoices Found</h3>
        <p className="text-muted-foreground">
          {statusFilter === 'all' 
            ? 'No invoices have been created for this project yet.'
            : `No invoices with "${getStatusText(statusFilter)}" status found.`
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12"></TableHead>
              <TableHead className="text-foreground font-medium">Invoice Number</TableHead>
              <TableHead className="text-foreground font-medium">Invoice Date</TableHead>
              <TableHead className="text-foreground font-medium">Due Date</TableHead>
              <TableHead className="text-foreground font-medium text-right">Amount Billed</TableHead>
              <TableHead className="text-foreground font-medium text-right">Amount Paid</TableHead>
              <TableHead className="text-foreground font-medium">Status</TableHead>
              <TableHead className="text-foreground font-medium">Contract</TableHead>
              <TableHead className="text-foreground font-medium">Milestone/Stage</TableHead>
              <TableHead className="text-foreground font-medium">Notes</TableHead>
              <TableHead className="text-foreground font-medium text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id} className="hover:bg-muted/30">
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                  >
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {invoice.number}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(invoice.issue_date)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(invoice.due_date)}
                </TableCell>
                <TableCell className="text-right font-medium text-foreground">
                  {formatCurrency(invoice.total)}
                </TableCell>
                <TableCell className="text-right font-medium text-foreground">
                  {formatCurrency(invoice.paid_to_date)}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={getStatusBadgeVariant(invoice.status)}
                    className="text-xs font-medium"
                  >
                    {getStatusText(invoice.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {invoice.contract_name || '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {invoice.milestone_stage || '-'}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[200px] truncate">
                  {invoice.notes || '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-muted"
                    >
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant={invoice.status === 'paid' ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 px-3 text-xs whitespace-nowrap"
                      onClick={() => handleMarkAsPaid(invoice.id, invoice.total, invoice.status)}
                    >
                      {invoice.status === 'paid' ? 'Paid' : 'Mark as Paid'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-destructive/10"
                      onClick={() => handleDeleteInvoice(invoice.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};