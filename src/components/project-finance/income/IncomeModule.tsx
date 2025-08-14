import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InvoiceDrawer } from './InvoiceDrawer';
import { PaymentModal } from './PaymentModal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, FileText, Download, Send, DollarSign, Clock, AlertCircle, Mail, Edit, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  number: string;
  client_name: string;
  client_email: string | null;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'part_paid' | 'paid' | 'overdue' | 'void';
  subtotal: number;
  tax: number;
  total: number;
  paid_to_date: number;
  notes: string | null;
}

interface IncomeModuleProps {
  projectId: string;
}

export const IncomeModule = ({ projectId }: IncomeModuleProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [projectId]);

  const getStatusBadge = (status: Invoice['status'], paidAmount: number, total: number) => {
    const isOverdue = status === 'overdue';
    const balance = total - paidAmount;

    if (status === 'paid') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
    }
    if (status === 'part_paid') {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Part Paid</Badge>;
    }
    if (isOverdue) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Overdue</Badge>;
    }
    if (status === 'sent') {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Sent</Badge>;
    }
    if (status === 'draft') {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Draft</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setIsDrawerOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDrawerOpen(true);
  };

  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentModalOpen(true);
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      // Update status to sent
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'sent' })
        .eq('id', invoice.id);

      if (error) throw error;

      // Log event
      await supabase.from('events').insert({
        project_id: projectId,
        name: 'invoice_sent',
        ref_table: 'invoices',
        ref_id: invoice.id,
        payload: { invoice_number: invoice.number, client_email: invoice.client_email }
      });

      toast({
        title: "Success",
        description: "Invoice sent successfully"
      });
      
      loadInvoices();
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast({
        title: "Error",
        description: "Failed to send invoice",
        variant: "destructive"
      });
    }
  };

  const handleGeneratePDF = async (invoice: Invoice) => {
    toast({
      title: "Coming Soon",
      description: "PDF generation will be implemented soon"
    });
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (statusFilter === 'all') return true;
    return invoice.status === statusFilter;
  });

  const summaryData = {
    totalBilled: invoices.reduce((sum, inv) => sum + inv.total, 0),
    totalPaid: invoices.reduce((sum, inv) => sum + inv.paid_to_date, 0),
    outstanding: invoices.reduce((sum, inv) => sum + (inv.total - inv.paid_to_date), 0),
    overdue: invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + (inv.total - inv.paid_to_date), 0),
  };

  return (
    <div className="space-y-6">

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoices</CardTitle>
            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md text-sm bg-background"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="part_paid">Part Paid</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
              <Button onClick={handleCreateInvoice} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Invoice
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading invoices...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-foreground">
              No invoices found. Create your first invoice to get started.
            </div>
          ) : (
            <div className="w-full">
              <table className="w-full border-collapse table-fixed">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium w-20">Number</th>
                    <th className="text-left p-2 font-medium">Client</th>
                    <th className="text-left p-2 font-medium w-24">Issue Date</th>
                    <th className="text-left p-2 font-medium w-24">Due Date</th>
                    <th className="text-left p-2 font-medium w-20">Total</th>
                    <th className="text-left p-2 font-medium w-20">Paid</th>
                    <th className="text-left p-2 font-medium w-20">Balance</th>
                    <th className="text-left p-2 font-medium w-20">Status</th>
                    <th className="text-left p-2 font-medium w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-mono text-sm truncate">{invoice.number}</td>
                      <td className="p-2 truncate">{invoice.client_name}</td>
                      <td className="p-2 text-sm">{format(new Date(invoice.issue_date), 'MMM dd, yyyy')}</td>
                      <td className="p-2 text-sm">{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</td>
                      <td className="p-2 font-medium text-sm">{formatCurrency(invoice.total)}</td>
                      <td className="p-2 font-medium text-sm">{formatCurrency(invoice.paid_to_date)}</td>
                      <td className="p-2 font-medium text-sm">{formatCurrency(invoice.total - invoice.paid_to_date)}</td>
                      <td className="p-2">{getStatusBadge(invoice.status, invoice.paid_to_date, invoice.total)}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditInvoice(invoice)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {invoice.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendInvoice(invoice)}
                              title="Send Invoice"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGeneratePDF(invoice)}
                            title="Generate PDF"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          {invoice.status !== 'paid' && invoice.status !== 'void' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRecordPayment(invoice)}
                              title="Record Payment"
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <InvoiceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        invoice={selectedInvoice}
        projectId={projectId}
        onSaved={loadInvoices}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoice={selectedInvoice}
        onSaved={loadInvoices}
      />
    </div>
  );
};