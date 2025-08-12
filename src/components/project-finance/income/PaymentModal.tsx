import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';

interface Invoice {
  id: string;
  number: string;
  client_name: string;
  total: number;
  paid_to_date: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSaved: () => void;
}

export const PaymentModal = ({ isOpen, onClose, invoice, onSaved }: PaymentModalProps) => {
  const [formData, setFormData] = useState({
    amount: '',
    paid_on: new Date().toISOString().split('T')[0],
    method: 'bank_transfer',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    try {
      setLoading(true);

      const amount = parseFloat(formData.amount);
      if (amount <= 0) {
        throw new Error('Payment amount must be greater than 0');
      }

      const remainingBalance = invoice.total - invoice.paid_to_date;
      if (amount > remainingBalance) {
        throw new Error('Payment amount cannot exceed the remaining balance');
      }

      const { error } = await supabase
        .from('invoice_payments')
        .insert({
          invoice_id: invoice.id,
          amount: amount,
          paid_on: formData.paid_on,
          method: formData.method as any,
          notes: formData.notes || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });

      onSaved();
      onClose();
      
      // Reset form
      setFormData({
        amount: '',
        paid_on: new Date().toISOString().split('T')[0],
        method: 'bank_transfer',
        notes: '',
      });
    } catch (error: any) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to record payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!invoice) return null;

  const remainingBalance = invoice.total - invoice.paid_to_date;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment for invoice {invoice.number}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Invoice Summary */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Client:</span>
              <span className="text-sm font-medium">{invoice.client_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Invoice Total:</span>
              <span className="text-sm font-medium">{formatCurrency(invoice.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Paid to Date:</span>
              <span className="text-sm font-medium">{formatCurrency(invoice.paid_to_date)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium">Remaining Balance:</span>
              <span className="text-sm font-bold">{formatCurrency(remainingBalance)}</span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Payment Amount *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                min="0"
                max={remainingBalance}
                step="0.01"
                required
              />
            </div>

            <div>
              <Label htmlFor="paid_on">Payment Date *</Label>
              <Input
                id="paid_on"
                type="date"
                value={formData.paid_on}
                onChange={(e) => setFormData({ ...formData, paid_on: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="method">Payment Method *</Label>
              <select
                id="method"
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                required
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Payment reference or additional notes"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};