import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { FileText, Download, Calendar, DollarSign, User, Mail, Phone } from 'lucide-react';

interface Bill {
  id: string;
  supplier_name: string;
  supplier_email: string | null;
  bill_no: string;
  reference_number: string | null;
  bill_date: string;
  due_date: string;
  status: 'draft' | 'submitted' | 'scheduled' | 'approved' | 'paid' | 'cancelled';
  payment_status?: string;
  subtotal: number;
  tax: number;
  total: number;
  paid_to_date: number;
  file_attachments: any;
  forwarded_bill: boolean;
  storage_path?: string;
  ai_confidence?: number;
  ai_summary?: string;
}

interface BillDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
  formatCurrency?: (amount: number) => string;
  formatDate?: (date: Date | string) => string;
}

export const BillDetailsDialog = ({ isOpen, onClose, bill, formatCurrency, formatDate }: BillDetailsDialogProps) => {
  if (!bill) return null;

  const defaultFormatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const defaultFormatDate = (date: Date | string) => format(new Date(date), 'dd MMM yyyy');

  const currencyFormatter = formatCurrency || defaultFormatCurrency;
  const dateFormatter = formatDate || defaultFormatDate;

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

  const fileAttachments = Array.isArray(bill.file_attachments) ? bill.file_attachments : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-semibold">Bill Details</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {bill.reference_number || bill.bill_no}
              </p>
            </div>
            {getStatusBadge(bill.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Supplier Information */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Supplier Information
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <span className="ml-2 font-medium">{bill.supplier_name}</span>
              </div>
              {bill.supplier_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="ml-2">{bill.supplier_email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bill Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Bill Date</span>
              </div>
              <p className="text-lg font-semibold">{dateFormatter(new Date(bill.bill_date))}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Due Date</span>
              </div>
              <p className={`text-lg font-semibold ${new Date(bill.due_date) < new Date() ? 'text-red-600' : ''}`}>
                {dateFormatter(new Date(bill.due_date))}
              </p>
            </div>
          </div>

          <Separator />

          {/* Financial Details */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial Details
            </h3>
            <div className="space-y-2 bg-muted/30 rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{currencyFormatter(bill.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax/GST:</span>
                <span className="font-medium">{currencyFormatter(bill.tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Total Amount:</span>
                <span className="font-bold text-lg">{currencyFormatter(bill.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid to Date:</span>
                <span className="font-medium text-green-600">{currencyFormatter(bill.paid_to_date)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Outstanding:</span>
                <span className="font-medium text-orange-600">{currencyFormatter(bill.total - bill.paid_to_date)}</span>
              </div>
            </div>
          </div>

          {/* AI Summary */}
          {bill.ai_summary && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold">AI Summary</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="text-foreground">{bill.ai_summary}</p>
                  {bill.ai_confidence && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Confidence: {(bill.ai_confidence * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Attachments */}
          {fileAttachments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Attachments
                </h3>
                <div className="space-y-2">
                  {fileAttachments.map((file: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-muted/30 rounded p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{file.name || `Attachment ${index + 1}`}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Additional Info */}
          {bill.forwarded_bill && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium">📧 This is a forwarded bill</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
