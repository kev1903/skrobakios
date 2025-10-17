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

// Helper function to parse contract amount from various formats
const parseContractAmount = (contractValue: string | undefined): number => {
  if (!contractValue) return 0;
  
  // Remove currency symbols, commas, and extract numeric value
  const numericValue = contractValue
    .replace(/[$,£€¥₹\s]/g, '') // Remove common currency symbols and spaces
    .replace(/[^\d.-]/g, ''); // Keep only digits, dots, and hyphens
  
  const parsed = parseFloat(numericValue);
  return isNaN(parsed) ? 0 : parsed;
};

// Helper function to convert date strings to YYYY-MM-DD format
const parseDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  
  try {
    // Try to parse various date formats
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

// Transform AI contract data to match form field structure
const transformContractData = (contractData: any) => {
  // Find the client party from the parties array
  const clientParty = contractData.parties?.find((p: any) => 
    p.role?.toLowerCase().includes('client')
  );
  
  return {
    ...contractData,
    // Map client information
    customer_name: clientParty?.name || '',
    customer_email: clientParty?.email || '',
    customer_phone: clientParty?.phone || clientParty?.mobile || '',
    customer_address: clientParty?.address || '',
    // Convert dates to YYYY-MM-DD format
    contract_date: parseDate(contractData.contract_date || contractData.execution_date),
    start_date: parseDate(contractData.start_date || contractData.commencement_date),
    end_date: parseDate(contractData.end_date || contractData.completion_date),
  };
};

interface ContractUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    project_id: string;
    name: string;
  };
  onUploadComplete?: () => void;
  editMode?: boolean;
  existingContract?: any;
}

export const ContractUploadDialog = ({ open, onOpenChange, project, onUploadComplete, editMode = false, existingContract }: ContractUploadDialogProps) => {
  const [formData, setFormData] = useState({
    file: null as File | null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(editMode);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize edit mode data
  React.useEffect(() => {
    if (editMode && existingContract) {
      setExtractedData(existingContract.contract_data || {});
      setShowPreview(true);
    } else if (!editMode) {
      setExtractedData({});
      setShowPreview(false);
      setFormData({ file: null });
    }
  }, [editMode, existingContract]);

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
        console.error('Edge function error:', error);
        // Extract more details from the error
        const errorMessage = error.message || 'Unknown error';
        throw new Error(`Processing failed: ${errorMessage}`);
      }

      if (!data || !data.success || !data.contractData) {
        console.error('Invalid response from edge function:', data);
        throw new Error('Processing failed: Invalid response from server');
      }

      // Transform AI data structure to match form fields
      const transformedData = transformContractData(data.contractData);
      
      // Store extracted data and show preview
      setExtractedData({
        ...transformedData,
        fileUrl: publicUrl,
        fileName: formData.file.name,
        filePath
      });
      setShowPreview(true);
      
      toast.success("Contract processed successfully! Review the extracted data below.");
    } catch (error) {
      console.error('Error processing contract:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Provide more helpful error messages
      if (errorMsg.includes('Failed to extract')) {
        toast.error("Unable to extract text from PDF. The file may be image-based, encrypted, or use unsupported encoding. Please ensure your PDF contains selectable text.");
      } else if (errorMsg.includes('Rate limit')) {
        toast.error("Rate limit exceeded. Please try again in a few moments.");
      } else if (errorMsg.includes('Payment required')) {
        toast.error("AI processing credits depleted. Please contact support.");
      } else {
        toast.error(`Failed to process contract: ${errorMsg}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!extractedData) return;

    setIsSaving(true);
    
    try {
      if (editMode && existingContract) {
        // Update existing contract
        const { error } = await supabase
          .from('project_contracts')
          .update({
            contract_data: extractedData,
            confidence: extractedData.ai_confidence,
            contract_amount: parseContractAmount(extractedData.contract_value),
            ai_summary_json: {
              summary: extractedData.ai_summary,
              confidence: extractedData.ai_confidence
            }
          })
          .eq('id', existingContract.id);

        if (error) {
          throw new Error(`Failed to update contract: ${error.message}`);
        }

        toast.success("Contract updated successfully!");
      } else {
        // Save new contract
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
            contract_amount: parseContractAmount(extractedData.contract_value),
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
      }
      
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[calc(100vh-var(--header-height,64px)-2rem)] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {editMode ? 'Edit Contract Data' : (showPreview ? 'Review Contract Data' : 'Upload Contract')}
          </DialogTitle>
          <DialogDescription>
            {editMode 
              ? 'Review and edit the contract data below.'
              : (showPreview 
                ? 'Review the AI-extracted contract data and click Save to confirm.'
                : 'Upload a contract document for this project. Supported formats: PDF, DOC, DOCX.'
              )
            }
          </DialogDescription>
        </DialogHeader>

        {!showPreview ? (
          <div className="space-y-6 py-4 overflow-y-auto flex-1">
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

            {/* No additional form fields needed */}
          </div>
        ) : (
          <div className="space-y-6 py-2 overflow-y-auto flex-1">
            {/* Extracted Contract Data Preview */}
            <div className="space-y-4">
              {/* AI ANALYSIS - Moved to Top */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-sm mb-2 text-blue-800 uppercase">AI Analysis</h3>
                <p className="text-sm text-blue-700 mb-2 leading-relaxed">{extractedData?.ai_summary}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-600">Confidence:</span>
                  <div className="bg-blue-200 rounded-full h-2 flex-1 max-w-20">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all" 
                      style={{ width: `${(extractedData?.ai_confidence || 0) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-blue-600">{Math.round((extractedData?.ai_confidence || 0) * 100)}%</span>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-sm mb-3 text-muted-foreground">CUSTOMER INFORMATION</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Customer Name</Label>
                    <Input
                      value={extractedData?.customer_name || ''}
                      onChange={(e) => setExtractedData(prev => ({ ...(prev || {}), customer_name: e.target.value }))}
                      className="h-8 text-sm"
                      placeholder="Customer name"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <Input
                      value={extractedData?.customer_email || ''}
                      onChange={(e) => setExtractedData(prev => ({ ...(prev || {}), customer_email: e.target.value }))}
                      className="h-8 text-sm"
                      placeholder="customer@email.com"
                      type="email"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <Input
                      value={extractedData?.customer_phone || ''}
                      onChange={(e) => setExtractedData(prev => ({ ...(prev || {}), customer_phone: e.target.value }))}
                      className="h-8 text-sm"
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Address</Label>
                    <Textarea
                      value={extractedData?.customer_address || ''}
                      onChange={(e) => setExtractedData(prev => ({ ...(prev || {}), customer_address: e.target.value }))}
                      className="min-h-[60px] text-sm"
                      placeholder="Customer address"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-sm mb-3 text-muted-foreground">CONTRACT DETAILS</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Contract Value</Label>
                    <Input
                      value={extractedData?.contract_value || ''}
                      onChange={(e) => setExtractedData(prev => ({ ...(prev || {}), contract_value: e.target.value }))}
                      className="h-8 text-sm font-medium text-green-600"
                      placeholder="$0.00"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Contract Date</Label>
                    <Input
                      value={extractedData?.contract_date || ''}
                      onChange={(e) => setExtractedData(prev => ({ ...(prev || {}), contract_date: e.target.value }))}
                      className="h-8 text-sm"
                      placeholder="YYYY-MM-DD"
                      type="date"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Start Date</Label>
                    <Input
                      value={extractedData?.start_date || ''}
                      onChange={(e) => setExtractedData(prev => ({ ...(prev || {}), start_date: e.target.value }))}
                      className="h-8 text-sm"
                      placeholder="YYYY-MM-DD"
                      type="date"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">End Date</Label>
                    <Input
                      value={extractedData?.end_date || ''}
                      onChange={(e) => setExtractedData(prev => ({ ...(prev || {}), end_date: e.target.value }))}
                      className="h-8 text-sm"
                      placeholder="YYYY-MM-DD"
                      type="date"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-sm mb-2 text-muted-foreground">SCOPE OF WORK</h3>
                <Textarea
                  value={extractedData?.scope_of_work || ''}
                  onChange={(e) => setExtractedData(prev => ({ ...(prev || {}), scope_of_work: e.target.value }))}
                  className="min-h-[100px] text-sm"
                  placeholder="Describe the scope of work..."
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-sm mb-2 text-muted-foreground">PAYMENT TERMS</h3>
                <Textarea
                  value={extractedData?.payment_terms || ''}
                  onChange={(e) => setExtractedData(prev => ({ ...(prev || {}), payment_terms: e.target.value }))}
                  className="min-h-[80px] text-sm"
                  placeholder="Describe the payment terms..."
                />
              </div>

              {/* Additional Payment Details */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-sm mb-3 text-muted-foreground">PAYMENT DETAILS</h3>
                <div className="grid grid-cols-2 gap-4">
                  {extractedData?.deposit_amount && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Deposit Amount</Label>
                      <p className="font-medium text-sm">{extractedData.deposit_amount}</p>
                      {extractedData.deposit_percentage && (
                        <p className="text-xs text-muted-foreground">({extractedData.deposit_percentage})</p>
                      )}
                    </div>
                  )}
                  {extractedData?.retention_amount && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Retention</Label>
                      <p className="font-medium text-sm">{extractedData.retention_amount}</p>
                      {extractedData.retention_percentage && (
                        <p className="text-xs text-muted-foreground">({extractedData.retention_percentage})</p>
                      )}
                    </div>
                  )}
                  {extractedData?.final_payment && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Final Payment</Label>
                      <p className="font-medium text-sm">{extractedData.final_payment}</p>
                    </div>
                  )}
                  {extractedData?.payment_method && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Payment Method</Label>
                      <p className="font-medium text-sm">{extractedData.payment_method}</p>
                    </div>
                  )}
                </div>
                {extractedData?.payment_schedule && extractedData.payment_schedule.length > 0 && (
                  <div className="mt-6 p-5 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-2 border-primary/20 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-base text-foreground">Payment Schedule</h3>
                      <div className="ml-auto px-3 py-1 bg-primary/10 rounded-full">
                        <span className="text-xs font-semibold text-primary">
                          {Array.isArray(extractedData.payment_schedule) ? extractedData.payment_schedule.length : 0} Milestones
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {Array.isArray(extractedData.payment_schedule) ? (
                        extractedData.payment_schedule.map((payment: any, idx: number) => (
                          <div key={idx} className="p-4 bg-background border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                  {payment.sequence || idx + 1}
                                </div>
                                <span className="font-semibold text-base text-foreground">
                                  {payment.stage_name || payment.milestone || `Stage ${payment.sequence || idx + 1}`}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">{payment.amount}</div>
                                {payment.percentage && (
                                  <div className="text-xs font-medium text-muted-foreground">
                                    {payment.percentage}% of total
                                  </div>
                                )}
                              </div>
                            </div>
                            {payment.description && (
                              <p className="text-sm text-muted-foreground mt-2 pl-11 leading-relaxed">{payment.description}</p>
                            )}
                            {payment.trigger && (
                              <div className="flex items-center gap-2 mt-3 pl-11">
                                <div className="px-3 py-1 bg-primary/5 border border-primary/20 rounded-full">
                                  <span className="text-xs font-medium text-primary">
                                    📍 Trigger: {payment.trigger}
                                  </span>
                                </div>
                              </div>
                            )}
                            {(payment.due_date || payment.due_days) && (
                              <div className="flex items-center gap-2 mt-2 pl-11">
                                <div className="px-3 py-1 bg-orange-50 border border-orange-200 rounded-full">
                                  <span className="text-xs font-medium text-orange-700">
                                    🗓️ Due: {payment.due_date || `${payment.due_days} days`}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">{String(extractedData.payment_schedule)}</p>
                      )}
                    </div>
                  </div>
                )}
                {extractedData?.late_payment_terms && (
                  <div className="mt-3">
                    <Label className="text-xs text-muted-foreground">Late Payment Terms</Label>
                    <p className="text-sm">{extractedData.late_payment_terms}</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        <DialogFooter>
          {!showPreview ? (
            <>
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
            </>
          ) : (
            <>
              {!editMode && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSaving}
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    {editMode ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    {editMode ? 'Update Contract' : 'Save Contract'}
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};