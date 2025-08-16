import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, DollarSign } from 'lucide-react';

interface Invoice {
  id: string;
  number: string;
  client_name: string;
  issue_date: string;
  due_date: string;
  total: number;
  status: string;
  paid_to_date: number;
}

interface AwaitingPaymentsTableProps {
  projectId: string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}

export const AwaitingPaymentsTable: React.FC<AwaitingPaymentsTableProps> = ({
  projectId,
  formatCurrency,
  formatDate
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  useEffect(() => {
    fetchApprovedInvoices();
  }, [projectId]);

  const fetchApprovedInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'sent') // Approved invoices have 'sent' status
        .order('due_date', { ascending: true });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching approved invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(invoices.map(inv => inv.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleSelectInvoice = (invoiceId: string, checked: boolean) => {
    if (checked) {
      setSelectedInvoices(prev => [...prev, invoiceId]);
    } else {
      setSelectedInvoices(prev => prev.filter(id => id !== invoiceId));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Approved</Badge>;
      case 'part_paid':
        return <Badge variant="secondary">Part Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading approved invoices...</p>
        </div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-foreground">
          <div className="h-12 w-12 mx-auto mb-4 text-muted-foreground flex items-center justify-center">
            <DollarSign className="h-8 w-8" />
          </div>
          <p className="text-foreground">No approved invoices awaiting payment.</p>
          <p className="text-sm mt-2 text-muted-foreground">Approved invoices will appear here when ready for payment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="w-full">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-2 font-medium w-12 text-xs">
                <input 
                  type="checkbox" 
                  className="rounded" 
                  checked={selectedInvoices.length === invoices.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th className="text-left p-2 font-medium w-16 text-foreground text-xs">View</th>
              <th className="text-left p-2 font-medium text-foreground text-xs">Client</th>
              <th className="text-left p-2 font-medium w-32 text-foreground text-xs">Invoice #</th>
              <th className="text-left p-2 font-medium w-28 text-foreground text-xs">Issue Date</th>
              <th className="text-left p-2 font-medium w-28 text-foreground text-xs">Due Date</th>
              <th className="text-left p-2 font-medium w-24 text-foreground text-xs">Amount</th>
              <th className="text-left p-2 font-medium w-20 text-foreground text-xs">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-b hover:bg-muted/25 transition-colors">
                <td className="p-2">
                  <input 
                    type="checkbox" 
                    className="rounded"
                    checked={selectedInvoices.includes(invoice.id)}
                    onChange={(e) => handleSelectInvoice(invoice.id, e.target.checked)}
                  />
                </td>
                <td className="p-2">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Eye className="h-3 w-3" />
                  </Button>
                </td>
                <td className="p-2 text-sm text-foreground">{invoice.client_name}</td>
                <td className="p-2 text-sm font-mono text-foreground">{invoice.number}</td>
                <td className="p-2 text-sm text-muted-foreground">{formatDate(invoice.issue_date)}</td>
                <td className="p-2 text-sm text-muted-foreground">{formatDate(invoice.due_date)}</td>
                <td className="p-2 text-sm font-semibold text-foreground">{formatCurrency(invoice.total)}</td>
                <td className="p-2">{getStatusBadge(invoice.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {selectedInvoices.length > 0 && (
        <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border">
          <span className="text-sm text-muted-foreground">
            {selectedInvoices.length} invoice(s) selected
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Mark as Paid
            </Button>
            <Button variant="outline" size="sm">
              Schedule Payment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};