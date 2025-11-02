import React, { useState, useRef, useEffect } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { invokeEdge } from '@/lib/invokeEdge';
import { Loader2, Upload, FileText, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Clipboard } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface BillPDFUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSaved?: () => void;
}

interface ExtractedBillData {
  supplier_name: string;
  supplier_email: string;
  bill_no: string;
  due_date: string;
  bill_date: string;
  reference_number: string;
  notes: string;
  subtotal: number;
  tax: number;
  total: number;
  line_items: Array<{
    description: string;
    qty: number;
    rate: number;
    amount: number;
    tax_code: string;
  }>;
}

export const BillPDFUploader = ({ isOpen, onClose, projectId, onSaved }: BillPDFUploaderProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [editableData, setEditableData] = useState<ExtractedBillData | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Reset state when dialog opens to prevent showing old data
  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      
      for (const clipboardItem of clipboardItems) {
        // Look for image types
        const imageTypes = clipboardItem.types.filter(type => type.startsWith('image/'));
        
        if (imageTypes.length > 0) {
          const imageType = imageTypes[0];
          const blob = await clipboardItem.getType(imageType);
          
          // Convert blob to file
          const fileName = `pasted-image-${Date.now()}.${imageType.split('/')[1]}`;
          const file = new File([blob], fileName, { type: imageType });
          
          handleFileSelect(file);
          toast({
            title: "Image Pasted",
            description: "Processing pasted image...",
          });
          return;
        }
      }
      
      // No image found in clipboard
      toast({
        title: "No Image Found",
        description: "Please copy an image to your clipboard first",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Paste error:', error);
      toast({
        title: "Paste Failed",
        description: "Unable to access clipboard. Please use the file upload instead.",
        variant: "destructive",
      });
    }
  };

  const parseExtractedDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    
    try {
      const cleaned = dateStr.trim();
      const dateObj = new Date(cleaned);
      
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toISOString().split('T')[0];
      }
      
      return new Date().toISOString().split('T')[0];
    } catch (e) {
      console.error('Date parsing error:', e);
      return new Date().toISOString().split('T')[0];
    }
  };

  const handleFileSelect = async (file: File) => {
    const isPDF = file.type.includes('pdf');
    const isImage = file.type.includes('image');
    
    console.log('=== NEW FILE SELECTED ===');
    console.log('File selected:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    // CRITICAL: Clear all previous extraction data before processing new file
    setExtractedData(null);
    setEditableData(null);
    setConfidence(0);
    setError(null);
    console.log('Cleared previous extraction data');
    
    if (!isPDF && !isImage) {
      setError('Please upload a PDF or image file (JPG, JPEG, PNG)');
      toast({
        title: "Invalid File",
        description: "Please upload a PDF or image file (JPG, JPEG, PNG)",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File is too large. Maximum size is 10MB. Please compress it at https://www.ilovepdf.com/compress_pdf');
      toast({
        title: "File Too Large",
        description: "File is too large. Maximum size is 10MB. Please compress it at https://www.ilovepdf.com/compress_pdf",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    
    // Create preview URL for the file
    const previewUrl = URL.createObjectURL(file);
    console.log('Preview URL created for:', file.name);
    setFilePreviewUrl(previewUrl);
    
    await uploadAndExtract(file);
  };

  const uploadAndExtract = async (file: File) => {
    console.log('=== STARTING STORAGE UPLOAD FOR:', file.name, '===');
    console.log('File size:', file.size, 'bytes');
    setUploading(true);
    setExtracting(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Get company_id from project first (required for security)
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('company_id')
        .eq('id', projectId)
        .single();

      if (projectError || !projectData?.company_id) {
        throw new Error('Could not find company for this project');
      }

      const companyId = projectData.company_id;
      console.log('Project company_id:', companyId);

      // Sanitize filename - replace spaces and special chars with underscores
      const sanitizedFileName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_{2,}/g, '_'); // Replace multiple underscores with single one
      
      console.log('Original filename:', file.name);
      console.log('Sanitized filename:', sanitizedFileName);
      
      // Step 1: Upload file to Supabase Storage
      console.log('Uploading to storage...');
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${sanitizedFileName}`;
      const filePath = `bills/${uniqueFileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bill-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('File uploaded to storage:', uploadData.path);
      setUploadProgress(30);

      // Step 2: Generate signed URL (60 second expiry)
      const { data: signedData, error: signedError } = await supabase.storage
        .from('bill-documents')
        .createSignedUrl(uploadData.path, 60);

      if (signedError || !signedData) {
        console.error('Signed URL error:', signedError);
        throw new Error('Failed to generate signed URL');
      }

      // Construct full signed URL (Supabase returns relative path)
      const SUPABASE_URL = 'https://xtawnkhvxgxylhxwqnmm.supabase.co';
      const fullSignedUrl = signedData.signedUrl.startsWith('http') 
        ? signedData.signedUrl 
        : `${SUPABASE_URL}/storage/v1${signedData.signedUrl}`;

      console.log('Signed URL generated:', fullSignedUrl);
      setUploadProgress(40);

      // Step 3: Call edge function with company_id for security
      const requestBody = {
        signed_url: fullSignedUrl,
        filename: sanitizedFileName,
        filesize: file.size,
        storage_path: uploadData.path,
        company_id: companyId // CRITICAL: Required for RLS security
      };
      
      console.log('=== CALLING EDGE FUNCTION ===');
      console.log('Request body with company_id:', companyId);
      
      const processingData = await invokeEdge('process-invoice', requestBody);

      console.log('Raw edge function response:', processingData);

      if (!processingData?.ok) {
        const errorMsg = processingData?.error || 'Edge function returned an error';
        console.error('Edge function error:', errorMsg);
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      
      setUploadProgress(100);
      
      if (processingData?.ok && processingData?.data) {
        const extraction = processingData.data;
        console.log('=== EXTRACTED DATA VERIFICATION ===');
        console.log('File uploaded:', file.name);
        console.log('Extracted Supplier:', extraction.supplier);
        console.log('Extracted Invoice #:', extraction.invoice_number);
        console.log('Extracted Total:', extraction.total);
        console.log('Extracted Confidence:', extraction.ai_confidence);
        
        setExtractedData(extraction);
        setConfidence((extraction.ai_confidence || 0) * 100);
        
        // Helper function to safely parse numeric strings
        const parseNumeric = (val: any): number => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const cleaned = val.replace(/[^0-9.-]/g, '');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? 0 : parsed;
          }
          return 0;
        };
        
        const mappedData = {
          supplier_name: extraction.supplier || '',
          supplier_email: extraction.supplier_email || '',
          bill_no: extraction.invoice_number || '',
          due_date: parseExtractedDate(extraction.due_date),
          bill_date: parseExtractedDate(extraction.invoice_date),
          reference_number: extraction.reference_number || '',
          notes: extraction.ai_summary || '',
          subtotal: parseNumeric(extraction.subtotal),
          tax: parseNumeric(extraction.tax), 
          total: parseNumeric(extraction.total),
          line_items: (extraction.line_items || []).map((item: any) => ({
            description: item.description || '',
            qty: parseNumeric(item.qty),
            rate: parseNumeric(item.rate),
            amount: parseNumeric(item.amount),
            tax_code: item.tax_code || ''
          }))
        };
        
        console.log('Mapped data for form:', mappedData);
        setEditableData(mappedData);
        
        toast({
          title: "Success",
          description: `Bill extracted with ${Math.round((extraction.ai_confidence || 0) * 100)}% confidence!`,
        });
      } else {
        throw new Error(processingData.error || 'Failed to process bill');
      }

    } catch (error) {
      console.error('=== EXTRACTION ERROR ===');
      console.error('Full error:', error);
      
      let errorMessage = 'Failed to process bill';
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        if (error.message.includes('too large') || error.message.includes('5MB') || error.message.includes('10MB')) {
          errorMessage = error.message;
        } else if (error.message.includes('Rate limit')) {
          errorMessage = 'AI rate limit exceeded. Please wait a moment and try again.';
        } else if (error.message.includes('Payment required') || error.message.includes('402')) {
          errorMessage = 'AI service requires additional credits. Please contact support.';
        } else if (error.message.includes('token') || error.message.includes('INVALID_ARGUMENT')) {
          errorMessage = 'PDF is too complex or large to process. Please compress it to under 5MB at https://www.ilovepdf.com/compress_pdf and try again.';
        } else if (error.message.includes('non-2xx') || error.message.includes('Edge Function')) {
          errorMessage = 'Server error processing invoice. Please check logs or try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      toast({
        title: "Extraction Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setExtracting(false);
      setUploadProgress(100);
    }
  };

  const resetState = () => {
    // Cleanup preview URL
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    
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
    setFilePreviewUrl(null);
    setNumPages(null);
    setPageNumber(1);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleSave = async () => {
    if (!editableData || !uploadedFile) return;

    setSaving(true);
    try {
      // Get company_id from project
      const { data: projectData } = await supabase
        .from('projects')
        .select('company_id')
        .eq('id', projectId)
        .single();

      if (!projectData?.company_id) {
        throw new Error('Could not find company for this project');
      }

      // Get storage path from extractedData if available
      const storagePath = extractedData?.storage_path || null;

      // Generate public URL for the attachment
      let fileAttachments = null;
      if (storagePath) {
        const { data: urlData } = await supabase.storage
          .from('bill-documents')
          .getPublicUrl(storagePath);
        
        if (urlData?.publicUrl) {
          fileAttachments = [{
            name: uploadedFile.name,
            url: urlData.publicUrl,
            size: uploadedFile.size,
            type: uploadedFile.type,
            uploaded_at: new Date().toISOString()
          }];
        }
      }

      // Create bill record
      const { data: created, error: createErr } = await supabase
        .from('bills')
        .insert({
          project_id: projectId,
          company_id: projectData.company_id,
          supplier_name: editableData.supplier_name || 'Unknown Supplier',
          supplier_email: editableData.supplier_email || null,
          bill_no: editableData.bill_no || `BILL-${Date.now()}`,
          bill_date: editableData.bill_date,
          due_date: editableData.due_date,
          reference_number: editableData.reference_number || null,
          subtotal: editableData.subtotal || 0,
          tax: editableData.tax || 0,
          total: editableData.total || 0,
          paid_to_date: 0,
          status: 'submitted',
          payment_status: 'unpaid',
          notes: editableData.notes || null,
          storage_path: storagePath,
          file_attachments: fileAttachments,
          ai_confidence: extractedData?.ai_confidence || null,
          ai_summary: extractedData?.ai_summary || null
        })
        .select('id')
        .single();

      if (createErr) throw createErr;

      // Insert bill line items
      const items = editableData.line_items || [];
      if (items.length > 0) {
        const itemsPayload = items
          .filter((it) => (it.description || '').trim() !== '')
          .map((it) => ({
            bill_id: created.id,
            description: it.description,
            qty: it.qty,
            rate: it.rate,
            amount: it.amount,
            tax_code: it.tax_code || null
          }));

        if (itemsPayload.length > 0) {
          const { error: itemsErr } = await supabase
            .from('bill_line_items')
            .insert(itemsPayload);
          if (itemsErr) throw itemsErr;
        }
      }

      toast({
        title: "Success",
        description: "Bill saved successfully!",
      });

      onSaved?.();
      onClose();
      resetState();

    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save bill",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl max-h-[95vh]">
        <DialogHeader>
          <DialogTitle>Upload Bill (Expense)</DialogTitle>
          <DialogDescription>
            Upload a PDF or image bill (JPG, JPEG, PNG) and our AI will extract the data automatically
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[calc(95vh-12rem)] overflow-hidden">
          {/* Left Column - Form */}
          <div className="space-y-6 overflow-y-auto pr-2 max-h-full">
          {/* File Upload Area */}
          {!uploadedFile && (
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Drop your file here or click to browse</p>
                <p className="text-sm text-muted-foreground">PDF, JPG, JPEG, or PNG • Maximum file size: 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-sm text-muted-foreground">OR</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handlePaste}
              >
                <Clipboard className="h-4 w-4 mr-2" />
                Paste from Clipboard
              </Button>
            </div>
          )}

          {/* Upload Progress */}
          {uploadedFile && (uploading || extracting) && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {uploading && 'Uploading...'}
                    {extracting && 'Extracting data with AI...'}
                  </p>
                </div>
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Extraction Failed</p>
                <p className="text-sm text-destructive/90 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Extracted Data Preview & Edit Form */}
          {editableData && !error && (
            <div className="space-y-4">
              {/* Show uploaded filename */}
              {uploadedFile && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Extracted from file:</p>
                    <p className="text-sm text-blue-700">{uploadedFile.name}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Data Extracted Successfully</p>
                    <p className="text-sm text-green-700">Confidence: {confidence.toFixed(0)}%</p>
                  </div>
                </div>
              </div>

              {/* Extracted Data Summary */}
              {extractedData && (
                <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Extracted Data Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium text-blue-800">Supplier:</span>
                        <p className="text-blue-700">{extractedData.supplier || 'Not extracted'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Invoice #:</span>
                        <p className="text-blue-700">{extractedData.invoice_number || 'Not extracted'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Invoice Date:</span>
                        <p className="text-blue-700">{extractedData.invoice_date || 'Not extracted'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Due Date:</span>
                        <p className="text-blue-700">{extractedData.due_date || 'Not extracted'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Subtotal:</span>
                        <p className="text-blue-700">${extractedData.subtotal || '0.00'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Tax:</span>
                        <p className="text-blue-700">${extractedData.tax || '0.00'}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium text-blue-800">Total:</span>
                        <p className="text-blue-700 text-lg font-semibold">${extractedData.total || '0.00'}</p>
                      </div>
                    </div>
                    {extractedData.line_items && extractedData.line_items.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-blue-300">
                        <span className="font-medium text-blue-800">Line Items ({extractedData.line_items.length}):</span>
                        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                          {extractedData.line_items.map((item: any, idx: number) => (
                            <div key={idx} className="text-xs text-blue-600 flex justify-between">
                              <span>{item.description}</span>
                              <span className="font-medium">${item.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {extractedData.ai_summary && (
                      <div className="mt-3 pt-3 border-t border-blue-300">
                        <span className="font-medium text-blue-800">AI Summary:</span>
                        <p className="text-blue-600 text-xs mt-1 italic">{extractedData.ai_summary}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Supplier Name *</Label>
                  <Input
                    value={editableData.supplier_name}
                    onChange={(e) => setEditableData({ ...editableData, supplier_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Supplier Email</Label>
                  <Input
                    type="email"
                    value={editableData.supplier_email}
                    onChange={(e) => setEditableData({ ...editableData, supplier_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bill Number *</Label>
                  <Input
                    value={editableData.bill_no}
                    onChange={(e) => setEditableData({ ...editableData, bill_no: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reference Number</Label>
                  <Input
                    value={editableData.reference_number}
                    onChange={(e) => setEditableData({ ...editableData, reference_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bill Date *</Label>
                  <Input
                    type="date"
                    value={editableData.bill_date}
                    onChange={(e) => setEditableData({ ...editableData, bill_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date *</Label>
                  <Input
                    type="date"
                    value={editableData.due_date}
                    onChange={(e) => setEditableData({ ...editableData, due_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtotal</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editableData.subtotal}
                    onChange={(e) => setEditableData({ ...editableData, subtotal: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tax</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editableData.tax}
                    onChange={(e) => setEditableData({ ...editableData, tax: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editableData.total}
                    onChange={(e) => setEditableData({ ...editableData, total: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={editableData.notes}
                  onChange={(e) => setEditableData({ ...editableData, notes: e.target.value })}
                  rows={3}
                  placeholder="AI-generated summary or additional notes"
                />
              </div>

              {/* Line Items Preview */}
              {editableData.line_items && editableData.line_items.length > 0 && (
                <div className="space-y-2">
                  <Label>Line Items ({editableData.line_items.length})</Label>
                  <div className="border rounded-lg max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="text-left p-2">Description</th>
                          <th className="text-right p-2">Qty</th>
                          <th className="text-right p-2">Rate</th>
                          <th className="text-right p-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editableData.line_items.map((item, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="p-2">{item.description}</td>
                            <td className="text-right p-2">{item.qty}</td>
                            <td className="text-right p-2">${item.rate.toFixed(2)}</td>
                            <td className="text-right p-2">${item.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    resetState();
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Different File
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => { onClose(); resetState(); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Bill
                  </Button>
                </div>
              </div>
            </div>
          )}
          </div>

          {/* Right Column - Preview */}
          <div className="hidden lg:flex border-l pl-6 overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Document Preview</h3>
                {filePreviewUrl && uploadedFile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(filePreviewUrl, '_blank')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                )}
              </div>
              <div className="flex-1 border rounded-lg overflow-hidden bg-white relative flex flex-col">
                {filePreviewUrl && uploadedFile ? (
                  uploadedFile.type.includes('pdf') ? (
                    <>
                      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
                        <Document
                          file={filePreviewUrl}
                          onLoadSuccess={onDocumentLoadSuccess}
                          loading={
                            <div className="flex items-center justify-center p-8">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                          }
                          error={
                            <div className="text-center p-8">
                              <AlertCircle className="h-12 w-12 mx-auto mb-2 text-destructive" />
                              <p className="text-sm text-destructive">Failed to load PDF</p>
                              <p className="text-xs text-muted-foreground mt-1">{uploadedFile.name}</p>
                            </div>
                          }
                        >
                          <Page
                            pageNumber={pageNumber}
                            width={500}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                          />
                        </Document>
                      </div>
                      {numPages && numPages > 1 && (
                        <div className="border-t bg-muted/30 p-2 flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                            disabled={pageNumber <= 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            Page {pageNumber} of {numPages}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                            disabled={pageNumber >= numPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
                      <img
                        src={filePreviewUrl}
                        alt="Bill Preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Upload a file to preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
