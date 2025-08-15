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
import { invokeEdge } from '@/lib/invokeEdge';
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

  // Function to parse AI-extracted dates to ISO format
  const parseExtractedDate = (dateStr: string): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    
    try {
      // Handle common AI date formats like "31 Jul 2025", "2025-07-31", "31/07/2025"
      const cleanDate = dateStr.trim();
      
      // If already in ISO format (YYYY-MM-DD), return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
        return cleanDate;
      }
      
      // Parse various date formats
      const parsedDate = new Date(cleanDate);
      
      // Check if date is valid
      if (isNaN(parsedDate.getTime())) {
        console.warn(`Could not parse date: ${dateStr}, using current date as fallback`);
        return new Date().toISOString().split('T')[0];
      }
      
      return parsedDate.toISOString().split('T')[0];
    } catch (error) {
      console.warn(`Error parsing date: ${dateStr}`, error);
      return new Date().toISOString().split('T')[0];
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

      // Connectivity check first
      await invokeEdge("ping", {});

      // Call new AI invoice processing function with OpenAI Files + Responses API
      const processingData = await invokeEdge('process-invoice', {
        signed_url: urlData.signedUrl,
        project_invoice_id: null // We can add DB integration later if needed
      });

      if (processingData.ok) {
        const extraction = processingData.data;
        setExtractedData(extraction);
        setConfidence((extraction.ai_confidence || 0) * 100); // Convert to percentage
        setEditableData({
          supplier_name: extraction.supplier || '',
          supplier_email: extraction.supplier_email || '',
          bill_no: extraction.invoice_number || '',
          due_date: parseExtractedDate(extraction.due_date),
          bill_date: parseExtractedDate(extraction.invoice_date),
          reference_number: '',
          notes: extraction.ai_summary || '',
          subtotal: parseFloat((extraction.subtotal || '0').replace(/,/g, '')),
          tax: parseFloat((extraction.tax || '0').replace(/,/g, '')), 
          total: parseFloat((extraction.total || '0').replace(/,/g, '')),
          description: `Invoice from ${extraction.supplier || 'Unknown Supplier'}`,
          wbs_code: '',
          line_items: extraction.line_items || []
        });
        
        toast({
          title: "Success",
          description: `Invoice extracted with ${Math.round((extraction.ai_confidence || 0) * 100)}% confidence!`,
        });
        
        // Don't auto-close - let user review and save manually
      } else {
        throw new Error(processingData.error || 'Failed to process invoice');
      }

    } catch (error) {
      console.error('Upload/processing error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process invoice');
    } finally {
      setUploading(false);
      setExtracting(false);
      setUploadProgress(100);
    }
  };

  // Since the AI function automatically creates the bill, we don't need a separate save function
  // The processing happens automatically when the file is uploaded

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

  const handleSave = async () => {
    if (!editableData || !uploadedFile) return;

    setSaving(true);
    try {
      // Insert the bill into the database
      const { error } = await supabase
        .from('bills')
        .insert({
          project_id: projectId,
          supplier_name: editableData.supplier_name || 'Unknown Supplier',
          bill_no: editableData.bill_no || 'N/A',
          bill_date: editableData.bill_date || new Date().toISOString().split('T')[0],
          due_date: editableData.due_date || new Date().toISOString().split('T')[0],
          subtotal: editableData.subtotal || 0,
          tax: editableData.tax || 0,
          total: editableData.total || 0,
          paid_to_date: 0,
          status: 'submitted',
          reference_number: editableData.reference_number || null,
          file_attachments: [{
            name: uploadedFile.name,
            url: uploadedFile.name,
            size: uploadedFile.size,
            type: uploadedFile.type
          }],
          source_system: 'ai_extraction',
          forwarded_bill: false
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice has been saved successfully!"
      });

      onSaved(); // Refresh the parent component
      handleClose();
    } catch (error) {
      console.error('Error saving bill:', error);
      toast({
        title: "Error",
        description: "Failed to save invoice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reference_number">Reference Number</Label>
                    <Input
                      id="reference_number"
                      value={editableData.reference_number}
                      onChange={(e) => setEditableData({...editableData, reference_number: e.target.value})}
                      placeholder="PO or reference number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="wbs_code">WBS Code</Label>
                    <Input
                      id="wbs_code"
                      value={editableData.wbs_code}
                      onChange={(e) => setEditableData({...editableData, wbs_code: e.target.value})}
                      placeholder="Work breakdown structure code"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={editableData.description}
                    onChange={(e) => setEditableData({...editableData, description: e.target.value})}
                    placeholder="Brief description of services/goods"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={editableData.notes}
                    onChange={(e) => setEditableData({...editableData, notes: e.target.value})}
                    placeholder="Additional notes or terms"
                  />
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
                               <td className="text-right p-3">
                                 ${typeof item.rate === 'number' ? item.rate.toFixed(2) : parseFloat(item.rate || '0').toFixed(2)}
                               </td>
                               <td className="text-right p-3">
                                 ${typeof item.amount === 'number' ? item.amount.toFixed(2) : parseFloat(item.amount || '0').toFixed(2)}
                               </td>
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
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            {extractedData && (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
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