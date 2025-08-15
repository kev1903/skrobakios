import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Eye, CheckCircle, Clock, DollarSign, X, CreditCard, FileText, Download, MoreVertical, RefreshCw, Edit, Trash2, Check } from 'lucide-react';
import { formatCurrency as defaultFormatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { BillEditDialog } from './BillEditDialog';

interface Bill {
  id: string;
  supplier_name: string;
  supplier_email: string | null;
  bill_no: string;
  reference_number: string | null;
  bill_date: string;
  due_date: string;
  status: 'draft' | 'submitted' | 'approved' | 'scheduled' | 'paid' | 'void';
  subtotal: number;
  tax: number;
  total: number;
  paid_to_date: number;
  file_attachments: any;
  forwarded_bill: boolean;
}

interface ExpensesModuleProps {
  projectId: string;
  statusFilter?: string;
  formatCurrency?: (amount: number) => string;
  formatDate?: (date: Date | string) => string;
  onDataUpdate?: (data: any) => void;
  refreshTrigger?: number;
}

export const ExpensesModule = ({ projectId, statusFilter = 'inbox', formatCurrency, formatDate, onDataUpdate, refreshTrigger }: ExpensesModuleProps) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editBill, setEditBill] = useState<Bill | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toast } = useToast();

  const loadBills = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBills(data || []);
      
      // Call onDataUpdate with the summary data
      if (onDataUpdate && data) {
        const summaryData = {
          totalBills: data.reduce((sum, bill) => sum + bill.total, 0),
          totalPaid: data.reduce((sum, bill) => sum + bill.paid_to_date, 0),
          outstanding: data.reduce((sum, bill) => sum + (bill.total - bill.paid_to_date), 0),
          pending: data.filter(bill => bill.status === 'submitted').length,
          totalItems: data.length
        };
        onDataUpdate(summaryData);
      }
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

  useEffect(() => {
    loadBills();
  }, [projectId]);

  // Listen for refresh triggers from parent
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      loadBills();
    }
  }, [refreshTrigger]);

  const getStatusBadge = (status: Bill['status']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Approved</Badge>;
      case 'submitted':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending Approval</Badge>;
      case 'scheduled':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Scheduled</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApproveBill = async (billId: string) => {
    try {
      const { error } = await supabase
        .from('bills')
        .update({ status: 'scheduled' })
        .eq('id', billId);

      if (error) throw error;

      // Log approval event
      await supabase.from('events').insert({
        project_id: projectId,
        name: 'bill_approved',
        ref_table: 'bills',
        ref_id: billId,
        payload: { approved_by: 'current_user', status: 'awaiting_payment' }
      });

      toast({
        title: "Success",
        description: "Invoice approved and moved to Awaiting Payment"
      });
      
      loadBills();
    } catch (error) {
      console.error('Error approving bill:', error);
      toast({
        title: "Error",
        description: "Failed to approve invoice",
        variant: "destructive"
      });
    }
  };

  const handleRecordPayment = async (billId: string) => {
    toast({
      title: "Coming Soon",
      description: "Payment recording will be implemented soon"
    });
  };

  const handleRerunExtraction = async (bill: Bill) => {
    try {
      const fileAttachments = Array.isArray(bill.file_attachments) ? bill.file_attachments : [];
      if (fileAttachments.length === 0) {
        toast({
          title: "No File Found",
          description: "No attachments found to re-process",
          variant: "destructive"
        });
        return;
      }

      const attachment = fileAttachments[0];
      
      toast({
        title: "Processing",
        description: "Re-running AI extraction on invoice..."
      });

      const { data, error } = await supabase.functions.invoke('process-invoice', {
        body: {
          fileUrl: attachment.url,
          fileName: attachment.name,
          projectId: projectId
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice extraction completed successfully"
      });
      
      loadBills();
    } catch (error) {
      console.error('Error re-running extraction:', error);
      toast({
        title: "Error",
        description: "Failed to re-run extraction",
        variant: "destructive"
      });
    }
  };

  const handleEditBill = (billId: string) => {
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      setEditBill(bill);
      setIsEditDialogOpen(true);
    }
  };

  const handleEditSaved = () => {
    loadBills();
  };

  const handleDeleteBill = async (billId: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm("Are you sure you want to delete this invoice? This action cannot be undone.");
    
    if (!confirmed) {
      return;
    }

    try {
      // Delete the bill from the database
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', billId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice deleted successfully"
      });
      
      // Reload the bills list to reflect the deletion
      loadBills();
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive"
      });
    }
  };

  const handleViewFile = (bill: Bill) => {
    const fileAttachments = Array.isArray(bill.file_attachments) ? bill.file_attachments : [];
    if (fileAttachments.length > 0) {
      setPreviewFile(fileAttachments[0].url);
      setIsPreviewOpen(true);
    } else {
      toast({
        title: "No File Found",
        description: "No attachments found to preview",
        variant: "destructive"
      });
    }
  };

  const filterBillsByStatus = (status: string) => {
    switch (status) {
      case 'inbox':
        return bills.filter(bill => bill.status === 'draft' || bill.status === 'submitted');
      case 'pending':
        return bills.filter(bill => bill.status === 'submitted');
      case 'scheduled':
        return bills.filter(bill => bill.status === 'approved' || bill.status === 'scheduled');
      case 'paid':
        return bills.filter(bill => bill.status === 'paid');
      default:
        return bills;
    }
  };

  const summaryData = {
    totalBills: bills.reduce((sum, bill) => sum + bill.total, 0),
    totalPaid: bills.reduce((sum, bill) => sum + bill.paid_to_date, 0),
    outstanding: bills.reduce((sum, bill) => sum + (bill.total - bill.paid_to_date), 0),
    pending: bills.filter(bill => bill.status === 'submitted').length,
  };

  const filteredBills = filterBillsByStatus(statusFilter);

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8 text-foreground">Loading bills...</div>
      ) : filteredBills.length === 0 ? (
        <div className="text-center py-8 text-foreground">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-foreground">No bills found in this category.</p>
          <p className="text-sm mt-2 text-muted-foreground">Upload bills or create new entries to get started.</p>
        </div>
      ) : (
        <div className="w-full">
          {/* Bills Table */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-2 font-medium w-12 text-xs">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="text-left p-2 font-medium w-16 text-foreground text-xs">View</th>
                <th className="text-left p-2 font-medium text-foreground text-xs">From</th>
                <th className="text-left p-2 font-medium w-32 text-foreground text-xs">Reference</th>
                <th className="text-left p-2 font-medium w-28 text-foreground text-xs">Date ↓</th>
                <th className="text-left p-2 font-medium w-28 text-foreground text-xs">Due date</th>
                <th className="text-left p-2 font-medium w-24 text-foreground text-xs">Amount</th>
                <th className="text-left p-2 font-medium w-12 text-xs"></th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="border-b hover:bg-muted/30 group h-12">
                  <td className="p-2"><input type="checkbox" className="rounded" /></td>
                  <td className="p-2">
                    <Button variant="ghost" size="sm" className="p-1 h-6 w-6" onClick={() => handleViewFile(bill)}>
                      <Eye className="h-3 w-3 text-blue-600" />
                    </Button>
                  </td>
                  <td className="p-2 text-foreground font-medium text-xs">{bill.supplier_name}</td>
                  <td className="p-2 text-foreground">
                    <div>
                      <div className="font-medium text-xs">{bill.reference_number || bill.bill_no}</div>
                      {bill.forwarded_bill && <div className="text-xs text-blue-600 italic">Forwarded Bill</div>}
                    </div>
                  </td>
                   <td className="p-2 text-foreground text-xs">{formatDate ? formatDate(new Date(bill.bill_date)) : format(new Date(bill.bill_date), 'dd MMM yyyy')}</td>
                   <td className="p-2 text-foreground text-xs">
                     {bill.due_date && (
                       <span className={new Date(bill.due_date) < new Date() ? 'text-red-600' : 'text-foreground'}>
                         {formatDate ? formatDate(new Date(bill.due_date)) : format(new Date(bill.due_date), 'dd MMM yyyy')}
                       </span>
                     )}
                   </td>
                   <td className="p-2 text-foreground font-medium text-xs">{formatCurrency ? formatCurrency(bill.total) : defaultFormatCurrency(bill.total)}</td>
                   <td className="p-2">
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 p-1 h-6 w-6">
                           <MoreVertical className="h-3 w-3" />
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                         {bill.status === 'submitted' && (
                           <DropdownMenuItem onClick={() => handleApproveBill(bill.id)}>
                             <Check className="h-4 w-4 mr-2 text-green-600" />
                             Approve
                           </DropdownMenuItem>
                         )}
                         <DropdownMenuItem onClick={() => handleRerunExtraction(bill)}>
                           <RefreshCw className="h-4 w-4 mr-2" />
                           Re-run Extraction
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleEditBill(bill.id)}>
                           <Edit className="h-4 w-4 mr-2" />
                           Edit Invoice
                         </DropdownMenuItem>
                         <DropdownMenuItem 
                           onClick={() => handleDeleteBill(bill.id)}
                           className="text-red-600 focus:text-red-600"
                         >
                           <Trash2 className="h-4 w-4 mr-2" />
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
      )}
      
      {/* Bill Edit Dialog */}
      <BillEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        bill={editBill}
        onSaved={handleEditSaved}
      />

      {/* PDF Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl h-[80vh] p-0">
          <DialogHeader className="p-4">
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden p-4">
            {previewFile && (
              <iframe
                src={previewFile}
                className="w-full h-full border-0 rounded"
                title="Document Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};