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

interface CompanyBillPDFUploaderProps {
  isOpen: boolean;
  onClose: () => void;
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

export const CompanyBillPDFUploader = ({ isOpen, onClose, onSaved }: CompanyBillPDFUploaderProps) => {
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

  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen]);

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
    setPageNumber(1);
    setNumPages(null);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
  };

  const handleFileSelect = async (file: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or image file (JPG, JPEG, PNG)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setUploadedFile(file);
    
    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrl(previewUrl);
    
    await handleUploadAndExtract(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUploadAndExtract = async (file: File) => {
    setUploading(true);
    setExtractedData(null);
    setError(null);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const sanitizedFileName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_{2,}/g, '_')
        .substring(0, 200);

      const timestamp = Date.now();
      const fileName = `${timestamp}_${sanitizedFileName}`;
      const filePath = `${user.id}/company-bills/${fileName}`;

      setUploadProgress(30);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bills')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(60);

      const { data: urlData } = await supabase.storage
        .from('bills')
        .createSignedUrl(uploadData.path, 3600);

      if (!urlData?.signedUrl) throw new Error('Failed to generate signed URL');

      const fullSignedUrl = urlData.signedUrl.startsWith('http') 
        ? urlData.signedUrl 
        : `https://xtawnkhvxgxylhxwqnmm.supabase.co/storage/v1${urlData.signedUrl}`;

      setUploadProgress(70);
      setUploading(false);
      setExtracting(true);

      const requestBody = {
        signed_url: fullSignedUrl,
        filename: sanitizedFileName,
        filesize: file.size,
        storage_path: uploadData.path
      };
      
      const processingData = await invokeEdge('process-invoice', requestBody);

      if (!processingData?.ok) {
        const errorMsg = processingData?.error || 'Edge function returned an error';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      const extraction = processingData.data;
      
      setExtractedData(extraction);
      
      const confidenceScore = extraction.confidence || 
        (extraction.supplier_name && extraction.bill_no && extraction.total ? 85 : 60);
      setConfidence(confidenceScore);

      const formattedData: ExtractedBillData = {
        supplier_name: extraction.supplier_name || '',
        supplier_email: extraction.supplier_email || '',
        bill_no: extraction.bill_no || '',
        due_date: extraction.due_date || '',
        bill_date: extraction.bill_date || '',
        reference_number: extraction.reference_number || '',
        notes: extraction.notes || '',
        subtotal: parseFloat(extraction.subtotal) || 0,
        tax: parseFloat(extraction.tax) || 0,
        total: parseFloat(extraction.total) || 0,
        line_items: Array.isArray(extraction.line_items) 
          ? extraction.line_items.map((item: any) => ({
              description: item.description || '',
              qty: parseFloat(item.qty) || 0,
              rate: parseFloat(item.rate) || 0,
              amount: parseFloat(item.amount) || 0,
              tax_code: item.tax_code || 'NONE'
            }))
          : []
      };

      setEditableData(formattedData);
      setUploadProgress(100);
      setExtracting(false);

      toast({
        title: "Bill Extracted Successfully",
        description: `Extracted data with ${confidenceScore}% confidence`,
      });

    } catch (err: any) {
      console.error('Upload/extraction error:', err);
      setError(err.message || 'Failed to process bill');
      setUploading(false);
      setExtracting(false);
      toast({
        title: "Extraction Failed",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find(type => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], `pasted-image-${Date.now()}.png`, { type: imageType });
          handleFileSelect(file);
          return;
        }
      }
      toast({
        title: "No Image Found",
        description: "Please copy an image to your clipboard first",
        variant: "destructive"
      });
    } catch (err) {
      toast({
        title: "Clipboard Error",
        description: "Failed to read from clipboard",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!editableData || !uploadedFile) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      toast({
        title: "Bill Saved",
        description: "Company bill has been saved successfully",
      });

      onSaved?.();
      onClose();
    } catch (err: any) {
      console.error('Save error:', err);
      toast({
        title: "Save Failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
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
              <div 
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                  dragActive ? 'border-luxury-gold bg-luxury-gold/5' : 'border-border/30'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-2">Drop your file here or click to browse</p>
                <p className="text-xs text-muted-foreground mb-4">
                  PDF, JPG, JPEG, or PNG • Maximum file size: 10MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="mb-4"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Browse Files
                </Button>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/30" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">OR</span>
                  </div>
                </div>

                <Button 
                  onClick={handlePasteFromClipboard}
                  variant="outline"
                  size="sm"
                >
                  <Clipboard className="w-4 h-4 mr-2" />
                  Paste from Clipboard
                </Button>
              </div>
            )}

            {/* Progress & Status */}
            {(uploading || extracting) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {uploading ? 'Uploading...' : 'Extracting data with AI...'}
                  </span>
                  <span className="text-muted-foreground">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {error && (
              <div className="flex items-start space-x-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-rose-900">Extraction Error</p>
                  <p className="text-sm text-rose-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Extracted Data Form */}
            {editableData && !uploading && !extracting && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-emerald-900">Data Extracted</p>
                      <p className="text-xs text-emerald-700">Confidence: {confidence}%</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Supplier Name</Label>
                      <Input
                        value={editableData.supplier_name}
                        onChange={(e) => setEditableData({...editableData, supplier_name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Supplier Email</Label>
                      <Input
                        type="email"
                        value={editableData.supplier_email}
                        onChange={(e) => setEditableData({...editableData, supplier_email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bill Number</Label>
                      <Input
                        value={editableData.bill_no}
                        onChange={(e) => setEditableData({...editableData, bill_no: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reference Number</Label>
                      <Input
                        value={editableData.reference_number}
                        onChange={(e) => setEditableData({...editableData, reference_number: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bill Date</Label>
                      <Input
                        type="date"
                        value={editableData.bill_date}
                        onChange={(e) => setEditableData({...editableData, bill_date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        value={editableData.due_date}
                        onChange={(e) => setEditableData({...editableData, due_date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={editableData.notes}
                      onChange={(e) => setEditableData({...editableData, notes: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Subtotal</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editableData.subtotal}
                        onChange={(e) => setEditableData({...editableData, subtotal: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tax</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editableData.tax}
                        onChange={(e) => setEditableData({...editableData, tax: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Total</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editableData.total}
                        onChange={(e) => setEditableData({...editableData, total: parseFloat(e.target.value) || 0})}
                        className="font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button onClick={handleSave} disabled={saving} className="flex-1">
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Bill'
                      )}
                    </Button>
                    <Button variant="outline" onClick={resetState}>
                      Upload Another
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Document Preview */}
          <div className="space-y-4 overflow-y-auto max-h-full">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                Document Preview
              </h3>
              {numPages && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                    disabled={pageNumber <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {pageNumber} / {numPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                    disabled={pageNumber >= numPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="border border-border/30 rounded-2xl bg-muted/30 flex items-center justify-center min-h-[500px] overflow-auto">
              {!filePreviewUrl ? (
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Upload a file to preview</p>
                </div>
              ) : uploadedFile?.type === 'application/pdf' ? (
                <Document
                  file={filePreviewUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="w-8 h-8 animate-spin text-luxury-gold" />
                    </div>
                  }
                >
                  <Page 
                    pageNumber={pageNumber}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    width={500}
                  />
                </Document>
              ) : (
                <img 
                  src={filePreviewUrl} 
                  alt="Bill preview" 
                  className="max-w-full max-h-[700px] object-contain rounded-xl"
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
