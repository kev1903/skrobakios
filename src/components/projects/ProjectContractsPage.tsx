import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, Download, Trash2, X, Eye, History, AlertTriangle, CheckCircle, Clock, AlertCircle, DollarSign, Calendar, Users, FileSignature, Shield, Gavel, ExternalLink, Loader2, RefreshCw, Building, Hammer, MapPin, Briefcase, Brain } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/hooks/useProjects";
import { ProjectSidebar } from "../ProjectSidebar";
import { getStatusColor, getStatusText } from "./utils";

interface ProjectContractsPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

interface ContractFile {
  id: string;
  name: string;
  file_url: string;
  file_path: string;
  uploaded_at: string;
  file_size: number;
  ai_summary_json: any;
  confidence: number;
  status: string;
  contract_data: any;
  is_canonical: boolean;
}

interface ContractVersion {
  id: string;
  version_number: number;
  file_url: string;
  file_path: string;
  file_size: number;
  ai_summary_json: any;
  confidence: number;
  status: string;
  is_canonical: boolean;
  created_at: string;
  created_by: string;
}

interface ContractMilestone {
  id: string;
  name: string;
  due_date: string;
  amount: number;
  status: string;
  description: string;
}

interface ContractRisk {
  id: string;
  risk_description: string;
  risk_level: 'low' | 'medium' | 'high';
  mitigation_strategy: string;
}

interface ContractAction {
  id: string;
  action_description: string;
  due_date: string;
  completed: boolean;
  assigned_to: string;
}

export const ProjectContractsPage = ({ project, onNavigate }: ProjectContractsPageProps) => {
  console.log('🔧 ProjectContractsPage rendered for project:', project.name);
  
  const [isUploading, setIsUploading] = useState(false);
  const [contracts, setContracts] = useState<ContractFile[]>([]);
  const [selectedContract, setSelectedContract] = useState<ContractFile | null>(null);
  const [contractVersions, setContractVersions] = useState<ContractVersion[]>([]);
  const [contractMilestones, setContractMilestones] = useState<ContractMilestone[]>([]);
  const [contractRisks, setContractRisks] = useState<ContractRisk[]>([]);
  const [contractActions, setContractActions] = useState<ContractAction[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contractName, setContractName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isVersionsDrawerOpen, setIsVersionsDrawerOpen] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionData, setExtractionData] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TypeScript utility functions
  const percentFrom = (text?: string | number) => {
    if (!text) return '—';
    const n = Number(text);
    if (Number.isFinite(n) && n > 0) {
      // If it's a decimal (0.75), convert to percentage
      if (n <= 1) return `${Math.round(n * 100)}%`;
      // If it's already a percentage (75), just round it
      return `${Math.round(n)}%`;
    }
    return '—';
  };

  // Load existing contracts
  useEffect(() => {
    loadContracts();
  }, [project.id]);

  // Load related data when contract is selected
  useEffect(() => {
    if (selectedContract) {
      loadContractVersions(selectedContract.id);
      loadContractMilestones(selectedContract.id);
      loadContractRisks(selectedContract.id);
      loadContractActions(selectedContract.id);
    }
  }, [selectedContract]);

  const loadContracts = async () => {
    try {
      console.log('Loading contracts for project:', project.id);
      
      // Force fresh data by adding a timestamp query parameter
      const { data, error } = await supabase
        .from('project_contracts')
        .select('*')
        .eq('project_id', project.id)
        .eq('status', 'active')  // Only load active contracts
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading contracts from database:', error);
        throw error;
      }

      console.log('Loaded contracts from database:', data?.length || 0);

      const formattedContracts = (data || []).map((contract: any) => ({
        id: contract.id,
        name: contract.name,
        file_url: contract.file_url,
        file_path: contract.file_path || contract.file_url,
        uploaded_at: contract.created_at,
        file_size: contract.file_size,
        ai_summary_json: contract.ai_summary_json || {},
        confidence: contract.confidence || 0,
        status: contract.status || 'active',
        contract_data: contract.contract_data || {},
        is_canonical: contract.is_canonical || true
      }));

      console.log('Setting contracts state with:', formattedContracts.length, 'contracts');
      setContracts(formattedContracts);
      
      // Only select first contract if there are contracts and none is currently selected
      if (formattedContracts.length > 0 && !selectedContract) {
        console.log('Auto-selecting first contract:', formattedContracts[0].name);
        setSelectedContract(formattedContracts[0]);
      } else if (formattedContracts.length === 0) {
        console.log('No contracts found, clearing selection');
        setSelectedContract(null);
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast.error('Failed to load contracts');
    }
  };

  const loadContractVersions = async (contractId: string) => {
    try {
      const { data, error } = await supabase
        .from('contract_versions')
        .select('*')
        .eq('contract_id', contractId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedVersions = (data || []).map((version: any) => ({
        id: version.id,
        version_number: 1, // Default version number since column doesn't exist
        file_url: version.storage_path || '',
        file_path: version.storage_path || '',
        file_size: version.file_size || 0,
        ai_summary_json: version.ai_summary_json || {},
        confidence: version.ai_confidence || 0,
        status: version.status || 'active',
        is_canonical: version.is_canonical || false,
        created_at: version.created_at,
        created_by: version.created_by || ''
      }));
      
      setContractVersions(formattedVersions);
    } catch (error) {
      console.error('Error loading contract versions:', error);
    }
  };

  const loadContractMilestones = async (contractId: string) => {
    try {
      const { data, error } = await supabase
        .from('contract_milestones')
        .select('*')
        .eq('contract_id', contractId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setContractMilestones(data || []);
    } catch (error) {
      console.error('Error loading contract milestones:', error);
    }
  };

  const loadContractRisks = async (contractId: string) => {
    try {
      const { data, error } = await supabase
        .from('contract_risks')
        .select('*')
        .eq('contract_id', contractId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedRisks = (data || []).map((risk: any) => ({
        id: risk.id,
        risk_description: risk.risk_description,
        risk_level: (risk.risk_level as 'low' | 'medium' | 'high') || 'low',
        mitigation_strategy: risk.mitigation_strategy
      }));
      
      setContractRisks(formattedRisks);
    } catch (error) {
      console.error('Error loading contract risks:', error);
    }
  };

  const loadContractActions = async (contractId: string) => {
    try {
      const { data, error } = await supabase
        .from('contract_actions')
        .select('*')
        .eq('contract_id', contractId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setContractActions(data || []);
    } catch (error) {
      console.error('Error loading contract actions:', error);
    }
  };

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
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      toast.error('Please drop PDF files only');
      return;
    }
    
    if (pdfFiles.length > 1) {
      toast.error('Please drop only one PDF file at a time');
      return;
    }
    
    const file = pdfFiles[0];
    setSelectedFile(file);
    setContractName(file.name.replace('.pdf', ''));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      setSelectedFile(file);
      setContractName(file.name.replace('.pdf', ''));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !contractName.trim()) {
      toast.error('Please select a file and enter a contract name');
      return;
    }

    setIsUploading(true);
    setIsExtracting(false);

    try {
      console.log('Starting contract upload...', { fileName: selectedFile.name, size: selectedFile.size });
      
      // Validate file type
      if (!selectedFile.type.includes('pdf')) {
        throw new Error('Only PDF files are supported');
      }

      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (selectedFile.size > maxSize) {
        throw new Error('File size must be less than 50MB');
      }

      // Upload file to Supabase Storage (documents bucket)
      const fileExtension = selectedFile.name.split('.').pop();
      const uniqueId = crypto.randomUUID();
      const fileName = `contracts/${project.id}/${uniqueId}-${selectedFile.name}`;
      
      console.log('Uploading file to storage:', fileName);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('File uploaded successfully:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      console.log('Public URL generated:', publicUrl);

      // Insert into project_contracts table
      const { data: contractRow, error: insertError } = await supabase
        .from('project_contracts')
        .insert({
          project_id: project.id,
          name: contractName.trim(),
          file_url: publicUrl,
          file_path: fileName,
          file_size: selectedFile.size,
          status: 'active',
          is_canonical: true,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error(`Database error: ${insertError.message}`);
      }

      console.log('Contract record created:', contractRow);

      // Start extraction process
      setIsExtracting(true);
      setIsUploading(false);

      console.log('Starting AI extraction...');

      // Generate signed URL (10 minutes TTL)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(fileName, 600); // 10 minutes

      if (signedUrlError) {
        console.error('Signed URL error:', signedUrlError);
        throw new Error(`Signed URL error: ${signedUrlError.message}`);
      }

      console.log('Signed URL created, calling extraction function...');

      // Call extract_unified Edge Function
      const { data: extractionResult, error: extractionError } = await supabase.functions.invoke('extract_unified', {
        body: {
          signed_url: signedUrlData.signedUrl,
          file_url: publicUrl,
          project_contract_id: contractRow.id
        }
      });

      if (extractionError) {
        console.error('Extraction function error:', extractionError);
        // Don't throw here - extraction failure shouldn't prevent upload success
        toast.warning('Contract uploaded successfully but AI extraction failed. You can retry extraction later.');
      } else {
        console.log('Extraction completed:', extractionResult);
        
        // Handle extraction response
        const extractedData = extractionResult?.data;
        if (extractedData) {
          if (extractedData.document_type !== 'contract') {
            toast.warning(`Document classified as ${extractedData.document_type}. This page is optimized for contracts.`);
          } else {
            // Update local state with extraction data
            setExtractionData(extractedData);
            toast.success(`Contract uploaded and processed with ${Math.round((extractedData.ai_confidence ?? 0) * 100)}% confidence`);
          }
        }
      }

      // Reset form and close dialog
      setSelectedFile(null);
      setContractName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsUploadDialogOpen(false);

      // Refresh contracts list
      console.log('Refreshing contracts list...');
      await loadContracts();
      
      // Select the newly uploaded contract after a brief delay
      setTimeout(() => {
        const newContract = contracts.find(c => c.id === contractRow.id);
        if (newContract) {
          setSelectedContract(newContract);
          console.log('Selected new contract:', newContract.name);
        }
      }, 1000);

      // Show success message if extraction was successful
      if (!extractionError) {
        toast.success('Contract uploaded and processed successfully!');
      } else {
        toast.success('Contract uploaded successfully!');
      }

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload contract';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setIsExtracting(false);
    }
  };

  const handleRerunExtraction = async (contractId: string, filePath: string) => {
    setIsExtracting(true);
    
    try {
      // Generate fresh signed URL
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 600); // 10 minutes

      if (signedUrlError) throw signedUrlError;

      // Call extract_unified Edge Function
      const { data: extractionResult, error: extractionError } = await supabase.functions.invoke('extract_unified', {
        body: {
          signed_url: signedUrlData.signedUrl,
          project_contract_id: contractId
        }
      });

      if (extractionError) throw extractionError;

      // Handle extraction response
      const extractedData = extractionResult?.data;
      if (extractedData) {
        if (extractedData.document_type !== 'contract') {
          toast.error(`Document classified as ${extractedData.document_type}. This page only displays contracts.`);
        } else {
          // Update local state with extraction data
          setExtractionData(extractedData);
          
          // Refresh the contract row to get updated data from database
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for DB update
          await loadContracts();
          
          toast.success(`Re-extraction completed with ${Math.round((extractedData.ai_confidence ?? 0) * 100)}% confidence`);
        }
      }
    } catch (error) {
      console.error('Re-extraction error:', error);
      toast.error('Failed to re-run extraction');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDelete = async (contractId: string, fileName: string) => {
    // Prevent multiple deletion attempts
    if (isDeleting) return;

    // Add confirmation dialog
    if (!confirm('Are you sure you want to delete this contract? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      console.log('Starting contract deletion:', { contractId, fileName });

      // Find the contract to get proper file path
      const contract = contracts.find(c => c.id === contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      console.log('Found contract:', contract);

      // Delete all related contract data first (with proper error handling)
      console.log('Deleting related contract data...');
      
      const { error: actionsError } = await supabase
        .from('contract_actions')
        .delete()
        .eq('contract_id', contractId);
      
      if (actionsError) {
        console.warn('Error deleting contract actions:', actionsError);
      }

      const { error: risksError } = await supabase
        .from('contract_risks')
        .delete()
        .eq('contract_id', contractId);
      
      if (risksError) {
        console.warn('Error deleting contract risks:', risksError);
      }

      const { error: milestonesError } = await supabase
        .from('contract_milestones')
        .delete()
        .eq('contract_id', contractId);
      
      if (milestonesError) {
        console.warn('Error deleting contract milestones:', milestonesError);
      }

      const { error: versionsError } = await supabase
        .from('contract_versions')
        .delete()
        .eq('contract_id', contractId);
      
      if (versionsError) {
        console.warn('Error deleting contract versions:', versionsError);
      }

      // Delete from storage first (using file_path)
      if (contract.file_path) {
        console.log('Deleting file from storage:', contract.file_path);
        
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([contract.file_path]);
        
        if (storageError) {
          console.error('Storage deletion error:', storageError);
          // Don't throw here - continue with database deletion even if storage fails
        } else {
          console.log('File deleted from storage successfully');
        }
      }

      // Delete from database last
      console.log('Deleting contract from database...');
      const { error: dbError } = await supabase
        .from('project_contracts')
        .delete()
        .eq('id', contractId);

      if (dbError) {
        console.error('Database deletion error:', dbError);
        throw dbError;
      }

      console.log('Contract deleted from database successfully');

      // If selected contract was deleted, clear selection
      if (selectedContract?.id === contractId) {
        setSelectedContract(null);
      }

      // Reload contracts to ensure UI is in sync
      console.log('Reloading contracts...');
      await loadContracts();
      
      console.log('Contract deletion completed successfully');
      toast.success('Contract and all related data deleted successfully');
      
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete contract';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'active': { label: 'Active', variant: 'default' as const, icon: CheckCircle },
      'needs_review': { label: 'Needs Review', variant: 'secondary' as const, icon: AlertCircle },
      'error': { label: 'Error', variant: 'destructive' as const, icon: AlertTriangle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getConfidenceBadge = (confidence: number) => {
    const getVariant = () => {
      if (confidence >= 80) return 'default';
      if (confidence >= 60) return 'secondary';
      return 'outline';
    };
    
    return (
      <Badge variant={getVariant()}>
        {confidence}% confidence
      </Badge>
    );
  };

  const getRiskLevelColor = (level: 'low' | 'medium' | 'high') => {
    const colors = {
      low: 'text-green-600 bg-green-50 border-green-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      high: 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[level];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const handleCreateProgressClaim = () => {
    // Emit event for creating progress claim
    toast.success('Progress claim creation initiated');
  };

  if (!selectedContract) {
    return (
      <div className="flex bg-background">
        {/* Fixed Project Sidebar */}
        <div className="fixed left-0 top-0 h-full w-48 z-40">
          <ProjectSidebar
            project={project}
            onNavigate={onNavigate}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            activeSection="contracts"
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-48 bg-background">
          <div className="p-6 min-h-full">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No contracts available</h3>
                <p className="text-muted-foreground mb-4">Upload a contract to get started</p>
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Contract
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Upload New Contract</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 p-6">
                      {/* Contract Name Input */}
                      <div className="space-y-2">
                        <Label htmlFor="contract-name" className="text-sm font-medium">Contract Name</Label>
                        <Input
                          id="contract-name"
                          type="text"
                          value={contractName}
                          onChange={(e) => setContractName(e.target.value)}
                          placeholder="Enter contract name"
                        />
                      </div>

                      {/* Drag & Drop Upload Area */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">PDF Document</Label>
                        <div
                          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
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
                          
                          <Upload className={`w-8 h-8 mx-auto mb-3 transition-colors ${
                            dragActive ? "text-primary" : "text-muted-foreground"
                          }`} />
                          
                          <h3 className="font-medium mb-2">
                            {dragActive ? "Drop your PDF here" : "Drop PDF file here"}
                          </h3>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            or click to browse and select a file
                          </p>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Browse Files
                          </Button>
                        </div>
                      </div>

                      {/* Selected File Display */}
                      {selectedFile && (
                        <div className="bg-muted/30 rounded-lg p-3 flex items-center justify-between border">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-red-500" />
                            <div>
                              <p className="font-medium text-sm">{selectedFile.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedFile(null);
                              setContractName("");
                              if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                              }
                            }}
                            className="text-muted-foreground hover:text-destructive h-6 w-6 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsUploadDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUpload}
                          disabled={!selectedFile || !contractName.trim() || isUploading || isExtracting}
                          className="flex-1"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : isExtracting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing with AI...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use extractionData if available, otherwise fall back to database data
  const currentData = extractionData || selectedContract.contract_data || {};
  const extractedContract = currentData.contract || currentData || selectedContract.ai_summary_json || {};
  const aiSummary = selectedContract.ai_summary_json || {};
  
  
  // Check if extraction completely failed
  const extractionFailed = selectedContract.confidence === 0 && 
    (!selectedContract.ai_summary_json || Object.keys(selectedContract.ai_summary_json).length === 0) &&
    (!selectedContract.contract_data || Object.keys(selectedContract.contract_data).length === 0);

  // Provide meaningful fallback values when extraction failed
  const fallbackContract = extractionFailed ? {
    // Extract basic info from filename and project data
    contract_value: null,
    contract_price: null,
    total_value: null,
    gst_included: true,
    payment_terms: null,
    payment_schedule: null,
    payment_method: null,
    deposit_percentage: null,
    deposit_amount: null,
    retention_percentage: 5,
    retention_amount: null,
    principal: null,
    client_name: null,
    principal_abn: null,
    principal_address: null,
    contractor: null, 
    contractor_name: null,
    contractor_abn: null,
    contractor_address: null,
    project_address: project.location,
    scope_of_work: null,
    project_description: null,
    special_conditions: null,
    execution_date: null,
    contract_date: null,
    start_date: null,
    effective_date: null,
    completion_date: null,
    practical_completion: null,
    expiry_date: null,
    duration: null,
    contract_duration: null,
    liquidated_damages: null,
    governing_law: null,
    variations: null,
    insurance_requirements: null,
    ai_summary: "AI extraction failed due to document size exceeding OpenAI's token limits. The PDF contains too much text content to process in a single request. Please try using a smaller, summarized version of the contract or contact support for assistance with large documents.",
    extraction_failed: true
  } : {
    ...extractedContract
  };
  
  const title = fallbackContract.title || fallbackContract.name || aiSummary.title || selectedContract.name;
  
  // Current confidence - use extractionData first, then database
  const currentConfidence = extractionData?.ai_confidence ?? selectedContract.confidence ?? 0;

  return (
    <div className="flex bg-background">
      {/* Fixed Project Sidebar */}
      <div className="fixed left-0 top-0 h-full w-48 z-40">
        <ProjectSidebar
          project={project}
          onNavigate={onNavigate}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          activeSection="contracts"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-48 bg-background">
        <div className="max-w-4xl mx-auto p-6 min-h-full">
          {/* Header */}
          <div className="mb-8">
            {/* Single Line Title */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-foreground">{title}</h1>
              
              <div className="flex items-center gap-2">
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload PDF
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Upload New Contract</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 p-6">
                      <div className="space-y-2">
                        <Label htmlFor="contract-name" className="text-sm font-medium">Contract Name</Label>
                        <Input
                          id="contract-name"
                          type="text"
                          value={contractName}
                          onChange={(e) => setContractName(e.target.value)}
                          placeholder="Enter contract name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">PDF Document</Label>
                        <div
                          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
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
                          
                          <Upload className={`w-8 h-8 mx-auto mb-3 transition-colors ${
                            dragActive ? "text-primary" : "text-muted-foreground"
                          }`} />
                          
                          <h3 className="font-medium mb-2">
                            {dragActive ? "Drop your PDF here" : "Drop PDF file here"}
                          </h3>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            or click to browse and select a file
                          </p>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Browse Files
                          </Button>
                        </div>
                      </div>

                      {selectedFile && (
                        <div className="bg-muted/30 rounded-lg p-3 flex items-center justify-between border">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-red-500" />
                            <div>
                              <p className="font-medium text-sm">{selectedFile.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedFile(null);
                              setContractName("");
                              if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                              }
                            }}
                            className="text-muted-foreground hover:text-destructive h-6 w-6 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsUploadDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUpload}
                          disabled={!selectedFile || !contractName.trim() || isUploading || isExtracting}
                          className="flex-1"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : isExtracting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing with AI...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  onClick={() => handleRerunExtraction(selectedContract.id, selectedContract.file_path || selectedContract.file_url)}
                  disabled={isExtracting}
                >
                  {isExtracting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Re-run extraction
                </Button>

                <Sheet open={isVersionsDrawerOpen} onOpenChange={setIsVersionsDrawerOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline">
                      <History className="w-4 h-4 mr-2" />
                      Versions
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-96">
                    <SheetHeader>
                      <SheetTitle>Versions & Files</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4 mt-6">
                      <div className="text-sm font-medium text-muted-foreground">Uploaded Contract Documents</div>
                      {contracts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No documents uploaded</p>
                      ) : (
                        <div className="space-y-3">
                          {contracts.map((contract) => (
                            <Card key={contract.id} className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-medium">{contract.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Uploaded {new Date(contract.uploaded_at).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(contract.file_size)}
                                  </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                  {getStatusBadge(contract.status)}
                                  {contract.confidence > 0 && getConfidenceBadge(contract.confidence)}
                                  {contract.is_canonical && (
                                    <Badge variant="outline" className="text-xs">Canonical</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                <Button size="sm" variant="outline" asChild>
                                  <a href={contract.file_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Open PDF
                                  </a>
                                </Button>
                                {!contract.is_canonical && (
                                  <Button size="sm" variant="outline">
                                    Set Canonical
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setSelectedContract(contract)}
                                >
                                  View Details
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  onClick={() => handleDelete(contract.id, contract.file_url)}
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Status badges and subtitle */}
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge(selectedContract.status)}
              {getConfidenceBadge(Math.round(currentConfidence * 100))}
            </div>
            <p className="text-muted-foreground">Contract management for {project.name}</p>
          </div>

          {/* Contract Report Summary */}
          <div className="space-y-8">
            {/* Show extraction failure warning */}
            {extractionFailed && (
              <Card className="border-amber-200 bg-amber-50/50">
                <CardHeader>
                  <CardTitle className="text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Contract Analysis Failed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-amber-700">
                      <p className="mb-2">The AI extraction failed because this document is too large to process (exceeds OpenAI's token limits).</p>
                      <p className="text-sm">Document size: <strong>{formatFileSize(selectedContract.file_size)}</strong></p>
                    </div>
                    <div className="bg-white p-4 rounded border border-amber-200">
                      <h4 className="font-medium text-amber-800 mb-2">Recommended Solutions:</h4>
                      <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                        <li>Try uploading a smaller, summarized version of the contract</li>
                        <li>Remove unnecessary pages (covers, appendices) and upload key pages only</li>
                        <li>Split the contract into sections and upload them separately</li>
                        <li>Contact support for assistance with large documents</li>
                      </ul>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => handleRerunExtraction(selectedContract.id, selectedContract.file_path || selectedContract.file_url)}
                        disabled={isExtracting}
                        className="border-amber-300 text-amber-700 hover:bg-amber-100"
                      >
                        {isExtracting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Retry Extraction
                      </Button>
                      <Button variant="outline" asChild>
                        <a href={selectedContract.file_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4 mr-2" />
                          View Original PDF
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Executive Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Contract Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Financial Overview */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 border-b pb-2">Financial Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Contract Sum</div>
                      <div className="text-2xl font-bold text-primary">
                        {fallbackContract.contract_value ? formatCurrency(fallbackContract.contract_value) : 
                         fallbackContract.contract_price ? formatCurrency(fallbackContract.contract_price) :
                         fallbackContract.total_value ? formatCurrency(fallbackContract.total_value) : '—'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {fallbackContract.gst_included ? 'Inc GST' : 'Ex GST'}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Payment Terms</div>
                      <div className="text-lg font-semibold">
                        {fallbackContract.payment_terms || 
                         fallbackContract.payment_schedule ||
                         fallbackContract.payment_method || (extractionFailed ? 'Not extracted' : '—')}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Deposit</div>
                      <div className="text-lg font-semibold">
                        {fallbackContract.deposit_percentage ? `${fallbackContract.deposit_percentage}%` :
                         fallbackContract.deposit_amount ? formatCurrency(fallbackContract.deposit_amount) :
                         extractionFailed ? 'Not extracted' : percentFrom(fallbackContract.payment_terms)}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Retention</div>
                      <div className="text-lg font-semibold">
                        {fallbackContract.retention_percentage ? `${fallbackContract.retention_percentage}%` :
                         fallbackContract.retention_amount ? formatCurrency(fallbackContract.retention_amount) :
                         extractionFailed ? 'Not extracted' : '5%'}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contract Parties */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 border-b pb-2">Contract Parties</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50/50 to-blue-100/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Building className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Principal</span>
                      </div>
                      <div className="space-y-2">
                        <div className="font-semibold">
                          {fallbackContract.principal || 
                           fallbackContract.client_name || 
                           fallbackContract.parties?.[0] || (extractionFailed ? 'Not extracted' : '—')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {fallbackContract.principal_abn ? `ABN: ${fallbackContract.principal_abn}` : (extractionFailed ? 'ABN: Not extracted' : 'ABN: —')}
                        </div>
                        {fallbackContract.principal_address && (
                          <div className="text-sm text-muted-foreground">
                            {fallbackContract.principal_address}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50/50 to-green-100/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Hammer className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800">Contractor</span>
                      </div>
                      <div className="space-y-2">
                        <div className="font-semibold">
                          {fallbackContract.contractor || 
                           fallbackContract.contractor_name || 
                           fallbackContract.parties?.[1] || (extractionFailed ? 'Not extracted' : '—')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {fallbackContract.contractor_abn ? `ABN: ${fallbackContract.contractor_abn}` : (extractionFailed ? 'ABN: Not extracted' : 'ABN: —')}
                        </div>
                        {fallbackContract.contractor_address && (
                          <div className="text-sm text-muted-foreground">
                            {fallbackContract.contractor_address}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Project Details */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 border-b pb-2">Project Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="font-medium">Project Address</span>
                        </div>
                        <div className="text-sm bg-muted/30 p-3 rounded">
                          {fallbackContract.project_address || (extractionFailed ? project.location || 'Not extracted' : '—')}
                        </div>
                      </div>
                      {(fallbackContract.scope_of_work || !extractionFailed) && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Briefcase className="w-4 h-4 text-primary" />
                            <span className="font-medium">Scope of Work</span>
                          </div>
                          <div className="text-sm bg-muted/30 p-3 rounded">
                            {fallbackContract.scope_of_work || (extractionFailed ? 'Not extracted' : '—')}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      {(fallbackContract.project_description || !extractionFailed) && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="font-medium">Description</span>
                          </div>
                          <div className="text-sm bg-muted/30 p-3 rounded">
                            {fallbackContract.project_description || (extractionFailed ? 'Not extracted' : '—')}
                          </div>
                        </div>
                      )}
                      {fallbackContract.special_conditions && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span className="font-medium">Special Conditions</span>
                          </div>
                          <div className="text-sm bg-amber-50/50 p-3 rounded border border-amber-200">
                            {fallbackContract.special_conditions}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* AI Summary */}
                {fallbackContract.ai_summary && (
                  <>
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Brain className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg">AI Contract Analysis</h3>
                      </div>
                      <div className={`p-4 rounded-lg border ${extractionFailed ? 'bg-red-50/50 border-red-200' : 'bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-blue-200'}`}>
                        <div className={`prose prose-sm max-w-none ${extractionFailed ? 'text-red-700' : 'text-muted-foreground'}`}>
                          {fallbackContract.ai_summary}
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
