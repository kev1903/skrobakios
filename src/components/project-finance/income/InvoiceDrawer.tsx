import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2 } from 'lucide-react';

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

interface InvoiceItem {
  id?: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
  wbs_code: string;
}

interface InvoiceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  projectId: string;
  onSaved: () => void;
}

export const InvoiceDrawer = ({ isOpen, onClose, invoice, projectId, onSaved }: InvoiceDrawerProps) => {
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    due_date: '',
    notes: '',
    tax: 10, // Default 10% tax
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', qty: 1, rate: 0, amount: 0, wbs_code: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (invoice) {
      setFormData({
        client_name: invoice.client_name,
        client_email: invoice.client_email || '',
        due_date: invoice.due_date,
        notes: invoice.notes || '',
        tax: invoice.tax,
      });
      // Load invoice items if editing
      loadInvoiceItems(invoice.id);
    } else {
      // Reset form for new invoice
      setFormData({
        client_name: '',
        client_email: '',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        notes: '',
        tax: 10,
      });
      setItems([{ description: '', qty: 1, rate: 0, amount: 0, wbs_code: '' }]);
    }
  }, [invoice, isOpen]);

  const loadInvoiceItems = async (invoiceId: string) => {
    try {
      const { data, error } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId);

      if (error) throw error;
      if (data && data.length > 0) {
        setItems(data.map(item => ({
          id: item.id,
          description: item.description,
          qty: item.qty,
          rate: item.rate,
          amount: item.amount,
          wbs_code: item.wbs_code || '',
        })));
      }
    } catch (error) {
      console.error('Error loading invoice items:', error);
    }
  };

  const calculateItemAmount = (qty: number, rate: number) => {
    return qty * rate;
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTaxAmount = () => {
    return (calculateSubtotal() * formData.tax) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount();
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate amount when qty or rate changes
    if (field === 'qty' || field === 'rate') {
      newItems[index].amount = calculateItemAmount(newItems[index].qty, newItems[index].rate);
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', qty: 1, rate: 0, amount: 0, wbs_code: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const invoiceData = {
        project_id: projectId,
        client_name: formData.client_name,
        client_email: formData.client_email || null,
        due_date: formData.due_date,
        notes: formData.notes || null,
        subtotal: calculateSubtotal(),
        tax: calculateTaxAmount(),
        total: calculateTotal(),
        status: 'draft' as const,
        number: invoice?.number || `INV-${Date.now()}`, // Generate number for new invoices
      };

      let invoiceId: string;

      if (invoice) {
        // Update existing invoice
        const { error } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', invoice.id);

        if (error) throw error;
        invoiceId = invoice.id;

        // Delete existing items and recreate them
        await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoiceId);
      } else {
        // Create new invoice
        const { data, error } = await supabase
          .from('invoices')
          .insert(invoiceData)
          .select()
          .single();

        if (error) throw error;
        invoiceId = data.id;
      }

      // Insert invoice items
      const itemsToInsert = items
        .filter(item => item.description.trim() !== '')
        .map(item => ({
          invoice_id: invoiceId,
          description: item.description,
          qty: item.qty,
          rate: item.rate,
          amount: item.amount,
          wbs_code: item.wbs_code || null,
        }));

      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Success",
        description: `Invoice ${invoice ? 'updated' : 'created'} successfully`,
      });

      onSaved();
      onClose();
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({
        title: "Error",
        description: `Failed to ${invoice ? 'update' : 'create'} invoice`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{invoice ? 'Edit Invoice' : 'Create New Invoice'}</SheetTitle>
          <SheetDescription>
            {invoice ? 'Update invoice details and line items' : 'Add invoice details and line items'}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_name">Client Name *</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    placeholder="Enter client name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="client_email">Client Email</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                    placeholder="Enter client email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="due_date">Due Date *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tax">Tax Rate (%)</Label>
                  <Input
                    id="tax"
                    type="number"
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                    placeholder="Enter tax rate"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes or terms"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Line Items</CardTitle>
                <Button onClick={addItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <Label htmlFor={`desc-${index}`}>Description</Label>
                      <Input
                        id={`desc-${index}`}
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`wbs-${index}`}>WBS Code</Label>
                      <Input
                        id={`wbs-${index}`}
                        value={item.wbs_code}
                        onChange={(e) => updateItem(index, 'wbs_code', e.target.value)}
                        placeholder="WBS code"
                      />
                    </div>
                    <div className="col-span-1">
                      <Label htmlFor={`qty-${index}`}>Qty</Label>
                      <Input
                        id={`qty-${index}`}
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateItem(index, 'qty', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`rate-${index}`}>Rate</Label>
                      <Input
                        id={`rate-${index}`}
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Amount</Label>
                      <Input
                        value={item.amount.toFixed(2)}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({formData.tax}%):</span>
                  <span className="font-medium">${calculateTaxAmount().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading || !formData.client_name || !formData.due_date}>
              {loading ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};