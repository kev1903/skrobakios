import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download, FileText, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Bill {
  id: string;
  supplier_name: string;
  bill_no: string;
  bill_date: string;
  due_date: string;
  total: number;
  status: string;
  reference_number?: string;
  file_attachments?: any;
}

interface InvoiceDetailsTableProps {
  projectId: string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}

export const InvoiceDetailsTable = ({ 
  projectId, 
  formatCurrency, 
  formatDate 
}: InvoiceDetailsTableProps) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBills();
  }, [projectId]);

  const loadBills = async () => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      console.error('Error loading bills:', error);
      toast({
        title: "Error",
        description: "Failed to load bills",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const handleDownloadAttachment = async (fileAttachmentsStr: string) => {
    try {
      const attachments = JSON.parse(fileAttachmentsStr);
      if (attachments && attachments.length > 0) {
        const attachment = attachments[0];
        window.open(attachment.url, '_blank');
      }
    } catch (error) {
      console.error('Error downloading attachment:', error);
      toast({
        title: "Error",
        description: "Failed to download attachment",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Invoice Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium">WBS</th>
                <th className="text-left p-3 font-medium">Subcontractor</th>
                <th className="text-left p-3 font-medium">Invoice Number</th>
                <th className="text-left p-3 font-medium">Attachment</th>
                <th className="text-left p-3 font-medium">Invoice Date</th>
                <th className="text-left p-3 font-medium">Due Date</th>
                <th className="text-left p-3 font-medium">Amount</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 ? (
                <tr className="border-b">
                  <td className="p-3 text-muted-foreground text-center" colSpan={9}>
                    No invoices found. Upload a PDF invoice to get started.
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="border-b hover:bg-muted/30">
                    <td className="p-3">
                      <span className="text-sm text-muted-foreground">
                        {bill.reference_number || '-'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{bill.supplier_name}</div>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-sm">{bill.bill_no}</span>
                    </td>
                    <td className="p-3">
                      {bill.file_attachments ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadAttachment(bill.file_attachments!)}
                          className="h-8 w-8 p-0"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{formatDate(bill.bill_date)}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{formatDate(bill.due_date)}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium">{formatCurrency(bill.total)}</span>
                    </td>
                    <td className="p-3">
                      <Badge className={`text-xs ${getStatusColor(bill.status)}`}>
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {bill.file_attachments && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadAttachment(bill.file_attachments!)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};