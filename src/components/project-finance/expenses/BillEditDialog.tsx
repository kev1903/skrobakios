import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Save,
  Loader2
} from 'lucide-react';

interface Bill {
  id: string;
  supplier_name: string;
  supplier_email?: string;
  bill_no: string;
  bill_date: string;
  due_date: string;
  subtotal: number;
  tax: number;
  total: number;
  reference_number?: string;
  source_system?: string;
}

interface BillEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
  onSaved: () => void;
}

export const BillEditDialog = ({ isOpen, onClose, bill, onSaved }: BillEditDialogProps) => {
  const [editableData, setEditableData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (bill && isOpen) {
      setEditableData({
        supplier_name: bill.supplier_name || '',
        supplier_email: bill.supplier_email || '',
        bill_no: bill.bill_no || '',
        bill_date: bill.bill_date || '',
        due_date: bill.due_date || '',
        reference_number: bill.reference_number || '',
        subtotal: bill.subtotal || 0,
        tax: bill.tax || 0,
        total: bill.total || 0,
      });
    }
  }, [bill, isOpen]);

  const handleSave = async () => {
    if (!editableData || !bill) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('bills')
        .update({
          supplier_name: editableData.supplier_name || 'Unknown Supplier',
          supplier_email: editableData.supplier_email || null,
          bill_no: editableData.bill_no || 'N/A',
          bill_date: editableData.bill_date || new Date().toISOString().split('T')[0],
          due_date: editableData.due_date || new Date().toISOString().split('T')[0],
          subtotal: editableData.subtotal || 0,
          tax: editableData.tax || 0,
          total: editableData.total || 0,
          reference_number: editableData.reference_number || null,
        })
        .eq('id', bill.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice has been updated successfully!"
      });

      onSaved();
      handleClose();
    } catch (error) {
      console.error('Error updating bill:', error);
      toast({
        title: "Error",
        description: "Failed to update invoice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setEditableData(null);
    onClose();
  };

  if (!editableData) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Invoice
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Bill Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier_name">Supplier Name</Label>
                  <Input
                    id="supplier_name"
                    value={editableData.supplier_name}
                    onChange={(e) => setEditableData({...editableData, supplier_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="supplier_email">Supplier Email</Label>
                  <Input
                    id="supplier_email"
                    type="email"
                    value={editableData.supplier_email}
                    onChange={(e) => setEditableData({...editableData, supplier_email: e.target.value})}
                    placeholder="Enter supplier email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bill_date">Invoice Date</Label>
                  <Input
                    id="bill_date"
                    type="date"
                    value={editableData.bill_date}
                    onChange={(e) => setEditableData({...editableData, bill_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={editableData.due_date}
                    onChange={(e) => setEditableData({...editableData, due_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="bill_no">Invoice Number</Label>
                  <Input
                    id="bill_no"
                    value={editableData.bill_no}
                    onChange={(e) => setEditableData({...editableData, bill_no: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reference_number">Reference Number</Label>
                <Input
                  id="reference_number"
                  value={editableData.reference_number}
                  onChange={(e) => setEditableData({...editableData, reference_number: e.target.value})}
                  placeholder="PO or reference number"
                />
              </div>

              {/* Totals */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <Label>Subtotal</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editableData.subtotal.toFixed(2)}
                    onChange={(e) => setEditableData({...editableData, subtotal: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label>Tax</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editableData.tax.toFixed(2)}
                    onChange={(e) => setEditableData({...editableData, tax: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label>Total</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editableData.total.toFixed(2)}
                    onChange={(e) => setEditableData({...editableData, total: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};