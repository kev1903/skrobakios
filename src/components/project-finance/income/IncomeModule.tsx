import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InvoiceDrawer } from './InvoiceDrawer';
import { PaymentModal } from './PaymentModal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, FileText, Download, Send, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Billed</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(summaryData.totalBilled)}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Paid</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(summaryData.totalPaid)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Outstanding</p>
                <p className="text-2xl font-bold text-yellow-900">{formatCurrency(summaryData.outstanding)}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Overdue</p>
                <p className="text-2xl font-bold text-red-900">{formatCurrency(summaryData.overdue)}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

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
            <div className="text-center py-8 text-muted-foreground">
              No invoices found. Create your first invoice to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Number</th>
                    <th className="text-left p-2 font-medium">Client</th>
                    <th className="text-left p-2 font-medium">Issue Date</th>
                    <th className="text-left p-2 font-medium">Due Date</th>
                    <th className="text-left p-2 font-medium">Total</th>
                    <th className="text-left p-2 font-medium">Paid</th>
                    <th className="text-left p-2 font-medium">Balance</th>
                    <th className="text-left p-2 font-medium">Status</th>
                    <th className="text-left p-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-mono text-sm">{invoice.number}</td>
                      <td className="p-2">{invoice.client_name}</td>
                      <td className="p-2">{new Date(invoice.issue_date).toLocaleDateString()}</td>
                      <td className="p-2">{new Date(invoice.due_date).toLocaleDateString()}</td>
                      <td className="p-2 font-medium">{formatCurrency(invoice.total)}</td>
                      <td className="p-2 font-medium">{formatCurrency(invoice.paid_to_date)}</td>
                      <td className="p-2 font-medium">{formatCurrency(invoice.total - invoice.paid_to_date)}</td>
                      <td className="p-2">{getStatusBadge(invoice.status, invoice.paid_to_date, invoice.total)}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditInvoice(invoice)}
                          >
                            Edit
                          </Button>
                          {invoice.status !== 'paid' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRecordPayment(invoice)}
                            >
                              Record Payment
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