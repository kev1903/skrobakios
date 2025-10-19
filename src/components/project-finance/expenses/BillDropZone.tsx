import React, { useState, useCallback } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type BillInsert = Database['public']['Tables']['bills']['Insert'];

interface BillDropZoneProps {
  projectId: string;
  onBillSaved: () => void;
  children?: React.ReactNode;
}

interface ExtractedData {
  supplierName: string;
  supplierEmail?: string;
  billNumber: string;
  referenceNumber?: string;
  billDate: string;
  dueDate?: string;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  confidence?: number;
}

export const BillDropZone: React.FC<BillDropZoneProps> = ({ projectId, onBillSaved, children }) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setUploadedFile(file);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });

      const base64Data = reader.result as string;

      // Call the process-invoice edge function
      const { data, error } = await supabase.functions.invoke('process-invoice', {
        body: { 
          fileData: base64Data,
          fileName: file.name 
        }
      });

      if (error) throw error;

      if (data && data.ok && data.data) {
        // Map the response to our ExtractedData format
        const extracted = data.data;
        setExtractedData({
          supplierName: extracted.supplier || 'Unknown',
          supplierEmail: extracted.supplier_email || undefined,
          billNumber: extracted.invoice_number || 'N/A',
          referenceNumber: extracted.reference_number || undefined,
          billDate: extracted.invoice_date || new Date().toISOString().split('T')[0],
          dueDate: extracted.due_date || undefined,
          subtotal: parseFloat(extracted.subtotal || '0'),
          tax: parseFloat(extracted.tax || '0'),
          total: parseFloat(extracted.total || '0'),
          notes: extracted.ai_summary || undefined,
          confidence: Math.round((extracted.ai_confidence || 0.95) * 100),
        });
        toast({
          title: "Bill Processed Successfully",
          description: `Extracted data with ${Math.round((extracted.ai_confidence || 0.95) * 100)}% confidence`,
        });
      } else {
        throw new Error('No data extracted');
      }
    } catch (error) {
      console.error('Error processing bill:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to extract data from the bill. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(file => 
      file.type === 'application/pdf' || 
      file.type === 'image/jpeg' || 
      file.type === 'image/jpg' ||
      file.type === 'image/png'
    );

    if (!validFile) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or JPG file",
        variant: "destructive",
      });
      return;
    }

    await processFile(validFile);
  }, [toast]);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const saveBill = async () => {
    if (!extractedData) return;

    try {
      const billData: BillInsert = {
        project_id: projectId,
        supplier_name: extractedData.supplierName,
        supplier_email: extractedData.supplierEmail || null,
        bill_no: extractedData.billNumber,
        reference_number: extractedData.referenceNumber || null,
        bill_date: extractedData.billDate,
        due_date: extractedData.dueDate || extractedData.billDate,
        subtotal: extractedData.subtotal || 0,
        tax: extractedData.tax || 0,
        total: extractedData.total || 0,
        paid_to_date: 0,
        status: 'submitted',
      };

      const { error } = await supabase.from('bills').insert(billData);

      if (error) throw error;

      toast({
        title: "Bill Saved",
        description: "Bill has been saved successfully",
      });

      resetState();
      onBillSaved();
    } catch (error) {
      console.error('Error saving bill:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save the bill",
        variant: "destructive",
      });
    }
  };

  const resetState = () => {
    setExtractedData(null);
    setUploadedFile(null);
    setIsProcessing(false);
  };

  // If showing extracted data, display the summary card
  if (extractedData) {
    return (
      <div className="space-y-4">
        <Card className="p-6 border-2 border-green-500 bg-green-50">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-900">Bill Extracted Successfully</h3>
                <p className="text-sm text-green-700">
                  From: {uploadedFile?.name} • Confidence: {extractedData.confidence || 95}%
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={resetState}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-700">Supplier</p>
              <p className="text-base text-gray-900">{extractedData.supplierName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Bill Number</p>
              <p className="text-base text-gray-900">{extractedData.billNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Bill Date</p>
              <p className="text-base text-gray-900">{extractedData.billDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Due Date</p>
              <p className="text-base text-gray-900">{extractedData.dueDate || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Subtotal</p>
              <p className="text-base text-gray-900">${extractedData.subtotal.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Tax</p>
              <p className="text-base text-gray-900">${extractedData.tax.toFixed(2)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-700">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">${extractedData.total.toFixed(2)}</p>
            </div>
          </div>

          {extractedData.notes && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Notes</p>
              <p className="text-sm text-gray-600">{extractedData.notes}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={saveBill} className="flex-1">
              Save Bill
            </Button>
            <Button variant="outline" onClick={resetState}>
              Cancel
            </Button>
          </div>
        </Card>

        {/* Show children below the extraction card */}
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  // If processing, show loader
  if (isProcessing) {
    return (
      <div className="h-full min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium">Processing Bill...</p>
          <p className="text-sm text-muted-foreground mt-2">SkAi is extracting data from your bill</p>
        </div>
      </div>
    );
  }

  // Default drag-and-drop zone
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative transition-all duration-200 ${
        isDragging ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-10 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Upload className="h-16 w-16 text-primary mx-auto mb-4" />
            <p className="text-xl font-semibold text-primary">Drop your bill here</p>
            <p className="text-sm text-muted-foreground mt-2">PDF or JPG files supported</p>
          </div>
        </div>
      )}

      {/* Drop zone hint */}
      <div className="mb-6 p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
        <div className="text-center">
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground mb-2">Drag & Drop Bills Here</p>
          <p className="text-sm text-muted-foreground mb-4">
            Drop PDF or JPG files to extract data with SkAi
          </p>
          <label htmlFor="file-upload" className="cursor-pointer">
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileInput}
              className="hidden"
            />
            <Button variant="outline" asChild>
              <span>
                <FileText className="h-4 w-4 mr-2" />
                Or Browse Files
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Original content */}
      {children}
    </div>
  );
};
