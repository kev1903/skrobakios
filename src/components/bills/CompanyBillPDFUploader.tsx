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
import { Loader2, Upload, FileText, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Clipboard, Info } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WBSActivitySelect } from '@/components/project-finance/expenses/WBSActivitySelect';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCompany } from '@/contexts/CompanyContext';

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
  project_id?: string | null;
  wbs_activity_id?: string | null;
  project_match_reason?: string;
  wbs_match_reason?: string;
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
  const [projects, setProjects] = useState<Array<{ id: string; name: string; project_id: string }>>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { currentCompany } = useCompany();

  // Load projects immediately when dialog opens
  useEffect(() => {
    if (isOpen) {
      resetState();
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      
      if (!currentCompany?.id) {
        console.error('❌ No current company selected');
        return [];
      }

      console.log('🔄 Loading projects for company:', currentCompany.name, currentCompany.id);

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, project_id')
        .eq('company_id', currentCompany.id)
        .order('name');

      if (projectsError) {
        console.error('❌ Error loading projects:', projectsError);
        return [];
      }

      console.log('✅ Loaded projects for', currentCompany.name, ':', projectsData?.length || 0, projectsData);
      
      if (projectsData) {
        setProjects(projectsData);
        return projectsData;
      }
      return [];
    } catch (error) {
      console.error('❌ Error loading projects:', error);
      return [];
    } finally {
      setLoadingProjects(false);
    }
  };

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

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError(null);
    setUploadedFile(file);
    
    // Convert PDF to image on client side before uploading
    let fileToUpload = file;
    if (file.type === 'application/pdf') {
      console.log('📄 Converting PDF to image for processing...');
      try {
        setUploading(true);
        setUploadProgress(10);
        
        // Load PDF and render first page to canvas
        const pdfData = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
        const page = await pdf.getPage(1);
        
        // Set scale for good quality
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Failed to get canvas context');
        }
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to convert canvas to blob'));
          }, 'image/png', 0.95);
        });
        
        // Create a new file from the blob
        fileToUpload = new File([blob], file.name.replace('.pdf', '.png'), { type: 'image/png' });
        
        console.log('✅ PDF converted to image:', fileToUpload.size, 'bytes');
        
        // Update the uploaded file state to the converted image
        setUploadedFile(fileToUpload);
        
        setUploadProgress(20);
      } catch (conversionError) {
        console.error('PDF conversion error:', conversionError);
        setError('Failed to convert PDF. Please try saving the PDF as an image first.');
        setUploading(false);
        return;
      }
    }
    
    const previewUrl = URL.createObjectURL(fileToUpload);
    setFilePreviewUrl(previewUrl);
    
    // Ensure projects are loaded before extraction
    let currentProjects = projects;
    if (currentProjects.length === 0) {
      console.log('⏳ Projects not loaded yet, loading now...');
      currentProjects = await loadProjects();
    }
    
    await handleUploadAndExtract(fileToUpload, currentProjects);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUploadAndExtract = async (file: File, availableProjects: typeof projects) => {
    setUploading(true);
    setExtractedData(null);
    setError(null);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Use the current company from context
      const companyId = currentCompany?.id;
      if (!companyId) {
        throw new Error('No company selected');
      }

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
        storage_path: uploadData.path,
        company_id: companyId // Pass company_id for project/WBS matching
      };
      
      console.log('📤 Sending to edge function with company_id:', companyId);
      
      const processingData = await invokeEdge('process-invoice', requestBody);

      if (!processingData?.ok) {
        const errorMsg = processingData?.error || 'Edge function returned an error';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      const extraction = processingData.data;
      
      setExtractedData(extraction);
      
      const confidenceScore = extraction.ai_confidence 
        ? Math.round(extraction.ai_confidence * 100)
        : (extraction.supplier && extraction.invoice_number && extraction.total ? 85 : 60);
      setConfidence(confidenceScore);

      const formattedData: ExtractedBillData = {
        supplier_name: extraction.supplier || '',
        supplier_email: extraction.supplier_email || '',
        bill_no: extraction.invoice_number || '',
        due_date: extraction.due_date || '',
        bill_date: extraction.invoice_date || '',
        reference_number: extraction.reference_number || '',
        notes: extraction.ai_summary || '',
        subtotal: parseFloat(extraction.subtotal || '0') || 0,
        tax: parseFloat(extraction.tax || '0') || 0,
        total: parseFloat(extraction.total || '0') || 0,
        project_id: extraction.project_id || null,
        wbs_activity_id: extraction.wbs_activity_id || null,
        project_match_reason: extraction.project_match_reason || '',
        wbs_match_reason: extraction.wbs_match_reason || '',
        line_items: Array.isArray(extraction.line_items) 
          ? extraction.line_items.map((item: any) => ({
              description: item.description || '',
              qty: parseFloat(item.qty || '0') || 0,
              rate: parseFloat(item.rate || '0') || 0,
              amount: parseFloat(item.amount || '0') || 0,
              tax_code: item.tax_code || 'NONE'
            }))
          : []
      };

      console.log('=== EXTRACTED DATA ===');
      console.log('Project ID from AI:', extraction.project_id);
      console.log('WBS Activity ID from AI:', extraction.wbs_activity_id);
      console.log('Project Match Reason:', extraction.project_match_reason);
      console.log('Available projects in state:', projects.length);
      console.log('Available projects passed:', availableProjects.length);

      // Validate that project_id matches an actual project from the passed list
      if (extraction.project_id) {
        const projectExists = availableProjects.find(p => p.id === extraction.project_id);
        console.log('✅ Project exists in list?', !!projectExists);
        if (projectExists) {
          console.log('✅ Matched project:', projectExists);
        } else {
          console.log('❌ Project ID not found in available projects');
          console.log('Available project IDs:', availableProjects.map(p => p.id));
        }
      }

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

      // Get user's company_id - get all active memberships first
      const { data: memberData, error: memberError } = await supabase
        .from('company_members')
        .select('company_id, role')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      console.log('Company membership lookup:', { memberData, memberError, userId: user.id });

      if (memberError) {
        console.error('Error fetching company membership:', memberError);
        throw new Error(`Database error: ${memberError.message}`);
      }

      if (!memberData || memberData.length === 0) {
        throw new Error('No active company membership found. Please contact your administrator to add you to a company.');
      }

      // Use the first active company (most recent)
      const companyId = memberData[0].company_id;

      // Get the storage path from uploaded file
      const fileExt = uploadedFile.name.split('.').pop()?.toLowerCase() || '';
      const timestamp = Date.now();
      const sanitizedFileName = uploadedFile.name
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_{2,}/g, '_')
        .substring(0, 200);
      const fileName = `${timestamp}_${sanitizedFileName}`;
      const storagePath = `${user.id}/company-bills/${fileName}`;

      // Insert bill record
      const { data: billData, error: billError } = await supabase
        .from('bills')
        .insert({
          company_id: companyId,
          created_by: user.id,
          project_id: editableData.project_id || null,
          supplier_name: editableData.supplier_name,
          supplier_email: editableData.supplier_email || null,
          bill_no: editableData.bill_no,
          bill_date: editableData.bill_date,
          due_date: editableData.due_date,
          reference_number: editableData.reference_number || null,
          notes: editableData.notes || null,
          subtotal: editableData.subtotal,
          tax: editableData.tax,
          total: editableData.total,
          status: 'submitted',
          payment_status: 'unpaid',
          paid_to_date: 0,
          storage_path: storagePath,
          ai_confidence: confidence / 100,
          ai_summary: editableData.notes || null,
        })
        .select()
        .single();

      if (billError) throw billError;

      // Insert line items if any
      if (editableData.line_items && editableData.line_items.length > 0) {
        const lineItems = editableData.line_items.map(item => ({
          bill_id: billData.id,
          description: item.description,
          qty: item.qty,
          rate: item.rate,
          amount: item.amount,
          tax_code: item.tax_code || null,
        }));

        const { error: lineItemsError } = await supabase
          .from('bill_line_items')
          .insert(lineItems);

        if (lineItemsError) {
          console.error('Error inserting line items:', lineItemsError);
        }
      }

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
                  PDF, JPG, JPEG, or PNG • Maximum file size: 5MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
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

                   {/* Project & WBS Assignment */}
                   <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border/30">
                     <div className="flex items-center gap-2">
                       <Label className="text-sm font-semibold">SkAi Assignment</Label>
                       {(editableData.project_match_reason || editableData.wbs_match_reason) && (
                         <Info className="w-4 h-4 text-muted-foreground" />
                       )}
                     </div>
                     
                     {editableData.project_match_reason && (
                       <Alert className="bg-blue-50 border-blue-200">
                         <Info className="h-4 w-4 text-blue-600" />
                         <AlertDescription className="text-xs text-blue-900">
                           <strong>Project Match:</strong> {editableData.project_match_reason}
                         </AlertDescription>
                       </Alert>
                     )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Project</Label>
                          <Select
                            value={editableData.project_id || 'none'}
                            onValueChange={(value) => {
                              console.log('Project selected:', value);
                              setEditableData({
                                ...editableData, 
                                project_id: value === 'none' ? null : value,
                                wbs_activity_id: value === 'none' ? null : editableData.wbs_activity_id // Clear WBS if project cleared
                              });
                            }}
                            disabled={loadingProjects}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={loadingProjects ? "Loading projects..." : "Select project..."} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Project</SelectItem>
                              {loadingProjects ? (
                                <SelectItem value="loading" disabled>Loading projects...</SelectItem>
                              ) : projects.length === 0 ? (
                                <SelectItem value="empty" disabled>No projects found</SelectItem>
                              ) : (
                                projects.map(project => (
                                  <SelectItem key={project.id} value={project.id}>
                                    {project.project_id} - {project.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                       <div className="space-y-2">
                         <Label>WBS Activity</Label>
                         {editableData.project_id ? (
                           <WBSActivitySelect
                             projectId={editableData.project_id}
                             value={editableData.wbs_activity_id || null}
                             onValueChange={(value) => setEditableData({...editableData, wbs_activity_id: value})}
                           />
                         ) : (
                           <Select disabled>
                             <SelectTrigger>
                               <SelectValue placeholder="Select project first..." />
                             </SelectTrigger>
                           </Select>
                         )}
                       </div>
                     </div>

                     {editableData.wbs_match_reason && (
                       <Alert className="bg-blue-50 border-blue-200">
                         <Info className="h-4 w-4 text-blue-600" />
                         <AlertDescription className="text-xs text-blue-900">
                           <strong>WBS Match:</strong> {editableData.wbs_match_reason}
                         </AlertDescription>
                       </Alert>
                     )}
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
