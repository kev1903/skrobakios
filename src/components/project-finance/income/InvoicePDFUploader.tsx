import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Edit3,
  Save,
  Loader2
} from 'lucide-react';

interface ExtractedInvoiceData {
  invoice_number?: string;
  invoice_date?: string;
  due_date?: string;
  vendor?: string;
  client?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  line_items?: Array<{
    description: string;
    qty: number;
    rate: number;
    amount: number;
  }>;
}

interface InvoicePDFUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSaved: () => void;
}

export const InvoicePDFUploader = ({ isOpen, onClose, projectId, onSaved }: InvoicePDFUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedInvoiceData | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [editableData, setEditableData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setUploadedFile(file);
    setError(null);
    setUploading(true);
    setUploadProgress(20);

    try {
      // Upload to Supabase Storage
      const fileName = `invoice_${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      // Get signed URL for the AI to access
      const { data: urlData } = await supabase.storage
        .from('documents')
        .createSignedUrl(fileName, 3600); // 1 hour expiry

      if (!urlData?.signedUrl) throw new Error('Failed to create signed URL');

      setUploadProgress(70);
      setUploading(false);
      setExtracting(true);

      // Call AI extraction function
      const { data: extractionData, error: extractionError } = await supabase.functions
        .invoke('extract_unified', {
          body: { pdfUrl: urlData.signedUrl }
        });

      if (extractionError) throw extractionError;

      const result = extractionData.result;
      if (result.document_type === 'invoice' && result.invoice) {
        setExtractedData(result.invoice);
        setConfidence(Math.round(result.ai_confidence * 100));
        setEditableData({
          client_name: result.invoice.client || result.invoice.vendor || '',
          client_email: '',
          due_date: result.invoice.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: '',
          subtotal: result.invoice.subtotal || 0,
          tax: result.invoice.tax || 0,
          total: result.invoice.total || 0,
          line_items: result.invoice.line_items || []
        });
      } else {
        throw new Error('Document is not recognized as an invoice or extraction failed');
      }

    } catch (error) {
      console.error('Upload/extraction error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process invoice');
    } finally {
      setUploading(false);
      setExtracting(false);
      setUploadProgress(100);
    }
  };

  const handleSave = async () => {
    if (!editableData) return;

    setSaving(true);
    try {
      // Create invoice
      const invoiceData = {
        project_id: projectId,
        client_name: editableData.client_name,
        client_email: editableData.client_email || null,
        due_date: editableData.due_date,
        notes: editableData.notes || null,
        subtotal: editableData.subtotal,
        tax: editableData.tax,
        total: editableData.total,
        status: 'draft' as const,
        number: extractedData?.invoice_number || `INV-${Date.now()}`,
      };

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Insert line items
      if (editableData.line_items && editableData.line_items.length > 0) {
        const itemsToInsert = editableData.line_items.map((item: any) => ({
          invoice_id: invoice.id,
          description: item.description,
          qty: item.qty,
          rate: item.rate,
          amount: item.amount,
          wbs_code: null,
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Success",
        description: "Invoice created successfully from PDF",
      });

      onSaved();
      onClose();
      resetState();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save invoice",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetState = () => {
    setUploadedFile(null);
    setUploading(false);
    setExtracting(false);
    setUploadProgress(0);
    setExtractedData(null);
    setConfidence(0);
    setError(null);
    setEditableData(null);
    setSaving(false);
    setDragActive(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Invoice PDF
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Upload Area */}
          {!uploadedFile && (
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                dragActive 
                  ? "border-primary bg-primary/5" 
                  : "border-border bg-muted/30 hover:bg-muted/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                dragActive ? "text-primary" : "text-muted-foreground"
              }`} />
              
              <h3 className="text-lg font-medium mb-2">
                {dragActive ? "Drop your PDF here" : "Drop invoice PDF here"}
              </h3>
              <p className="text-muted-foreground mb-4">
                or click to browse files
              </p>
              <Button variant="outline" size="sm">
                Browse Files
              </Button>
            </div>
          )}

          {/* Upload Progress */}
          {(uploading || extracting) && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="font-medium">
                      {uploading ? 'Uploading PDF...' : 'Extracting invoice data with AI...'}
                    </span>
                  </div>
                  <Progress value={uploading ? uploadProgress : 85} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Extracted Data Display */}
          {extractedData && editableData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Extracted Invoice Data
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      confidence >= 80 ? 'bg-green-100 text-green-800' :
                      confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {confidence}% confidence
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Basic Invoice Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client_name">Client Name</Label>
                    <Input
                      id="client_name"
                      value={editableData.client_name}
                      onChange={(e) => setEditableData({...editableData, client_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="client_email">Client Email</Label>
                    <Input
                      id="client_email"
                      type="email"
                      value={editableData.client_email}
                      onChange={(e) => setEditableData({...editableData, client_email: e.target.value})}
                      placeholder="Enter client email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    <Label>Invoice Number</Label>
                    <Input
                      value={extractedData.invoice_number || 'Auto-generated'}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                {/* Line Items */}
                {editableData.line_items && editableData.line_items.length > 0 && (
                  <div className="space-y-2">
                    <Label>Line Items</Label>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-3">Description</th>
                            <th className="text-right p-3">Qty</th>
                            <th className="text-right p-3">Rate</th>
                            <th className="text-right p-3">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {editableData.line_items.map((item: any, index: number) => (
                            <tr key={index} className="border-t">
                              <td className="p-3">{item.description}</td>
                              <td className="text-right p-3">{item.qty}</td>
                              <td className="text-right p-3">${item.rate?.toFixed(2)}</td>
                              <td className="text-right p-3">${item.amount?.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Totals */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <Label>Subtotal</Label>
                    <Input
                      type="number"
                      value={editableData.subtotal}
                      onChange={(e) => setEditableData({...editableData, subtotal: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>Tax</Label>
                    <Input
                      type="number"
                      value={editableData.tax}
                      onChange={(e) => setEditableData({...editableData, tax: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>Total</Label>
                    <Input
                      type="number"
                      value={editableData.total}
                      onChange={(e) => setEditableData({...editableData, total: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                {/* Low confidence warning */}
                {confidence < 70 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Low confidence extraction. Please review and verify all data before saving.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {extractedData && (
              <Button onClick={handleSave} disabled={saving || !editableData?.client_name}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Invoice
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};