import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, FileText, DollarSign, MoreHorizontal, CheckCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
  id: string;
  number: string;
  client_name: string;
  issue_date: string;
  due_date: string;
  status: string;
  total: number;
  paid_to_date: number;
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

      setInvoices(data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (invoiceId: string, total: number) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: 'paid', 
          paid_to_date: total 
        })
        .eq('id', invoiceId);

      if (error) {
        console.error('Error marking invoice as paid:', error);
        toast({
          title: "Error",
          description: "Failed to mark invoice as paid. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Invoice marked as paid successfully.",
      });
      
      loadInvoices();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast({
        title: "Error",
        description: "Failed to mark invoice as paid. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }

    try {
      // First delete invoice items
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoiceId);

      if (itemsError) {
        console.error('Error deleting invoice items:', itemsError);
        toast({
          title: "Error",
          description: "Failed to delete invoice items. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Then delete the invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (invoiceError) {
        console.error('Error deleting invoice:', invoiceError);
        toast({
          title: "Error",
          description: "Failed to delete invoice. Please try again.",
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
        <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
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
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-16">View</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Due date</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.client_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(invoice.issue_date)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(invoice.due_date)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">{formatCurrency(invoice.total)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <Badge variant={getStatusBadgeVariant(invoice.status)} className="text-xs">
                    {getStatusText(invoice.status)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                      >
                        <MoreHorizontal className="h-4 w-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleMarkAsPaid(invoice.id, invoice.total)}
                        disabled={invoice.status === 'paid'}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Paid
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Invoice
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};