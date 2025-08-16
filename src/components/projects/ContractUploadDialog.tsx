import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContractUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    project_id: string;
    name: string;
  };
  onUploadComplete?: () => void;
}

export const ContractUploadDialog = ({ open, onOpenChange, project, onUploadComplete }: ContractUploadDialogProps) => {
  const [formData, setFormData] = useState({
    file: null as File | null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, file }));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(file => 
      file.type === 'application/pdf' || 
      file.type === 'application/msword' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    
    if (validFile) {
      setFormData(prev => ({ ...prev, file: validFile }));
    }
  }, []);

  const removeFile = () => {
    setFormData(prev => ({ ...prev, file: null }));
  };

  const handleUpload = async () => {
    if (!formData.file) {
      toast.error("Please select a file.");
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload file to Supabase Storage
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `contracts/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, formData.file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Process contract with AI
      const { data, error } = await supabase.functions.invoke('process-contract', {
        body: {
          fileUrl: publicUrl,
          fileName: formData.file.name,
          projectId: project.id,
          name: formData.file.name,
          description: '',
          extractOnly: true // Just extract, don't save yet
        }
      });

      if (error) {
        throw new Error(`Processing failed: ${error.message}`);
      }

      // Store extracted data and show preview
      setExtractedData({
        ...data.contractData,
        fileUrl: publicUrl,
        fileName: formData.file.name,
        filePath
      });
      setShowPreview(true);
      
      toast.success("Contract processed successfully! Review the extracted data below.");
    } catch (error) {
      console.error('Error processing contract:', error);
      toast.error(`Failed to process contract: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!extractedData) return;

    setIsSaving(true);
    
    try {
      // Save to database
      const { error } = await supabase
        .from('project_contracts')
        .insert({
          project_id: project.id,
          name: formData.file?.name || 'Contract',
          file_url: extractedData.fileUrl,
          file_path: extractedData.filePath,
          file_size: formData.file?.size || 0,
          contract_data: extractedData,
          confidence: extractedData.ai_confidence,
          status: 'active',
          ai_summary_json: {
            summary: extractedData.ai_summary,
            confidence: extractedData.ai_confidence
          }
        });

      if (error) {
        throw new Error(`Failed to save contract: ${error.message}`);
      }

      toast.success("Contract saved successfully!");
      
      // Reset form and close dialog
      setFormData({ file: null });
      setExtractedData(null);
      setShowPreview(false);
      onOpenChange(false);
      
      // Call callback to refresh contracts list
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Error saving contract:', error);
      toast.error(`Failed to save contract: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ file: null });
    setExtractedData(null);
    setShowPreview(false);
    onOpenChange(false);
  };

  const handleBack = () => {
    setShowPreview(false);
    setExtractedData(null);
  };

  return (
    <>
      {!showPreview ? (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Contract
              </DialogTitle>
              <DialogDescription>
                Upload a contract document for this project. Supported formats: PDF, DOC, DOCX.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Drag & Drop Zone */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {!formData.file ? (
                  <>
                    <div className="flex flex-col items-center gap-4">
                      <div className="rounded-full bg-muted p-4">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-medium">Drop your contract here</p>
                        <p className="text-sm text-muted-foreground">
                          or{' '}
                          <label htmlFor="file-upload" className="text-primary cursor-pointer hover:underline">
                            browse files
                          </label>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Supports: PDF, DOC, DOCX</span>
                        <span>•</span>
                        <span>Max 10MB</span>
                      </div>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">{formData.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(formData.file.size / 1024)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!formData.file || isUploading}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Process Contract
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        // Full Page Contract Review
        <div className="fixed inset-0 z-50 bg-background">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-14 items-center px-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <h1 className="text-lg font-semibold">Review Contract Data</h1>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={isSaving}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Save Contract
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                <p className="text-muted-foreground">
                  Review the AI-extracted contract data and click Save to confirm.
                </p>

                {/* Customer Information */}
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="font-semibold text-base mb-4 text-muted-foreground">CUSTOMER INFORMATION</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-muted-foreground">Customer Name</Label>
                      <p className="font-medium text-lg">{extractedData?.customer_name || 'Not found'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Email</Label>
                      <p className="text-base">{extractedData?.customer_email || 'Not found'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Phone</Label>
                      <p className="text-base">{extractedData?.customer_phone || 'Not found'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Address</Label>
                      <p className="text-base">{extractedData?.customer_address || 'Not found'}</p>
                    </div>
                  </div>
                </div>

                {/* Contract Details */}
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="font-semibold text-base mb-4 text-muted-foreground">CONTRACT DETAILS</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-muted-foreground">Contract Value</Label>
                      <p className="font-medium text-2xl text-green-600">{extractedData?.contract_value || 'Not found'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Contract Date</Label>
                      <p className="text-base">{extractedData?.contract_date || 'Not found'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Start Date</Label>
                      <p className="text-base">{extractedData?.start_date || 'Not found'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">End Date</Label>
                      <p className="text-base">{extractedData?.end_date || 'Not found'}</p>
                    </div>
                  </div>
                </div>

                {/* Scope of Work */}
                {extractedData?.scope_of_work && (
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <h3 className="font-semibold text-base mb-3 text-muted-foreground">SCOPE OF WORK</h3>
                    <p className="text-base">{extractedData.scope_of_work}</p>
                  </div>
                )}

                {/* Payment Terms */}
                {extractedData?.payment_terms && (
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <h3 className="font-semibold text-base mb-3 text-muted-foreground">PAYMENT TERMS</h3>
                    <p className="text-base">{extractedData.payment_terms}</p>
                  </div>
                )}

                {/* Payment Schedule Table */}
                {(extractedData?.stage_payments?.length > 0 || 
                  extractedData?.progress_payments?.length > 0 || 
                  extractedData?.payment_tables?.length > 0) && (
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <h3 className="font-semibold text-base mb-4 text-muted-foreground">PAYMENT SCHEDULE</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/80">
                            <tr>
                              <th className="px-4 py-3 text-left font-medium">Payment Type</th>
                              <th className="px-4 py-3 text-left font-medium">Stage/Milestone</th>
                              <th className="px-4 py-3 text-left font-medium">Description</th>
                              <th className="px-4 py-3 text-right font-medium">%</th>
                              <th className="px-4 py-3 text-right font-medium">Amount</th>
                              <th className="px-4 py-3 text-left font-medium">Due</th>
                            </tr>
                          </thead>
                          <tbody>
                            {extractedData?.payment_tables?.length > 0 ? (
                              extractedData.payment_tables.map((table: any, tableIndex: number) => 
                                table.rows?.map((row: any, rowIndex: number) => {
                                  const isDeposit = row.stage_name?.toLowerCase().includes('deposit');
                                  return (
                                    <tr key={`table-${tableIndex}-${rowIndex}`} className="border-t">
                                      <td className="px-4 py-3">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                          isDeposit 
                                            ? 'bg-orange-100 text-orange-800' 
                                            : 'bg-blue-100 text-blue-800'
                                        }`}>
                                          {isDeposit ? 'Deposit' : 'Progress'}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 font-medium">{row.stage_name || 'N/A'}</td>
                                      <td className="px-4 py-3 text-muted-foreground">
                                        {row.description || row.work_involved || 'N/A'}
                                      </td>
                                      <td className="px-4 py-3 text-right font-medium text-blue-600">
                                        {row.percentage || 'N/A'}
                                      </td>
                                      <td className="px-4 py-3 text-right font-medium text-green-600">
                                        {row.amount || 'N/A'}
                                      </td>
                                      <td className="px-4 py-3 text-muted-foreground text-sm">
                                        {isDeposit ? 'Prior to work starting' : 'Upon stage completion'}
                                      </td>
                                    </tr>
                                  );
                                })
                              )
                            ) : extractedData?.stage_payments?.length > 0 ? (
                              extractedData.stage_payments.map((payment: any, index: number) => {
                                const isDeposit = payment.stage?.toLowerCase().includes('deposit');
                                return (
                                  <tr key={`stage-${index}`} className="border-t">
                                    <td className="px-4 py-3">
                                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                        isDeposit 
                                          ? 'bg-orange-100 text-orange-800' 
                                          : 'bg-blue-100 text-blue-800'
                                      }`}>
                                        {isDeposit ? 'Deposit' : 'Progress'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 font-medium">{payment.stage}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{payment.description || 'N/A'}</td>
                                    <td className="px-4 py-3 text-right font-medium text-blue-600">
                                      {payment.percentage || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-green-600">
                                      {payment.amount || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-sm">
                                      {payment.due_date || (isDeposit ? 'Prior to work starting' : 'Upon stage completion')}
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              extractedData?.progress_payments?.map((payment: any, index: number) => (
                                <tr key={`progress-${index}`} className="border-t">
                                  <td className="px-4 py-3">
                                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      Progress
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 font-medium">{payment.milestone}</td>
                                  <td className="px-4 py-3 text-muted-foreground">{payment.description || 'N/A'}</td>
                                  <td className="px-4 py-3 text-right font-medium text-blue-600">
                                    {payment.percentage || 'N/A'}
                                  </td>
                                  <td className="px-4 py-3 text-right font-medium text-green-600">
                                    {payment.amount || 'N/A'}
                                  </td>
                                  <td className="px-4 py-3 text-muted-foreground text-sm">
                                    Upon milestone completion
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Payment Details */}
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="font-semibold text-base mb-4 text-muted-foreground">PAYMENT DETAILS</h3>
                  <div className="grid grid-cols-2 gap-6">
                    {extractedData?.deposit_amount && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Deposit Amount</Label>
                        <p className="font-medium text-base">{extractedData.deposit_amount}</p>
                        {extractedData.deposit_percentage && (
                          <p className="text-sm text-muted-foreground">({extractedData.deposit_percentage})</p>
                        )}
                      </div>
                    )}
                    {extractedData?.retention_amount && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Retention</Label>
                        <p className="font-medium text-base">{extractedData.retention_amount}</p>
                        {extractedData.retention_percentage && (
                          <p className="text-sm text-muted-foreground">({extractedData.retention_percentage})</p>
                        )}
                      </div>
                    )}
                    {extractedData?.final_payment && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Final Payment</Label>
                        <p className="font-medium text-base">{extractedData.final_payment}</p>
                      </div>
                    )}
                    {extractedData?.payment_method && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Payment Method</Label>
                        <p className="font-medium text-base">{extractedData.payment_method}</p>
                      </div>
                    )}
                  </div>
                  {extractedData?.payment_schedule && (
                    <div className="mt-4">
                      <Label className="text-sm text-muted-foreground">Payment Schedule</Label>
                      <p className="text-base">{extractedData.payment_schedule}</p>
                    </div>
                  )}
                  {extractedData?.late_payment_terms && (
                    <div className="mt-4">
                      <Label className="text-sm text-muted-foreground">Late Payment Terms</Label>
                      <p className="text-base">{extractedData.late_payment_terms}</p>
                    </div>
                  )}
                </div>

                {/* AI Analysis */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-base mb-3 text-blue-800">AI ANALYSIS</h3>
                  <p className="text-base text-blue-700 mb-3">{extractedData?.ai_summary}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-blue-600">Confidence:</span>
                    <div className="bg-blue-200 rounded-full h-3 flex-1 max-w-32">
                      <div 
                        className="bg-blue-600 h-3 rounded-full" 
                        style={{ width: `${(extractedData?.ai_confidence || 0) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-blue-600">{Math.round((extractedData?.ai_confidence || 0) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};