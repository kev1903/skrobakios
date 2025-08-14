import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, Download, Trash2, X, Eye, History, AlertTriangle, CheckCircle, Clock, AlertCircle, DollarSign, Calendar, Users, FileSignature, Shield, Gavel, ExternalLink, Loader2, RefreshCw } from "lucide-react";
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
      const { data, error } = await supabase
        .from('project_contracts')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

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

      setContracts(formattedContracts);
      
      // Select first contract if none selected
      if (formattedContracts.length > 0 && !selectedContract) {
        setSelectedContract(formattedContracts[0]);
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
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
      // Upload file to Supabase Storage (documents bucket)
      const fileExtension = selectedFile.name.split('.').pop();
      const uniqueId = crypto.randomUUID();
      const fileName = `contracts/${project.id}/${uniqueId}-${selectedFile.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

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

      if (insertError) throw insertError;

      // Start extraction process
      setIsExtracting(true);
      setIsUploading(false);

      // Generate signed URL (10 minutes TTL)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(fileName, 600); // 10 minutes

      if (signedUrlError) throw signedUrlError;

      // Call extract_unified Edge Function
      const { data: extractionResult, error: extractionError } = await supabase.functions.invoke('extract_unified', {
        body: {
          signed_url: signedUrlData.signedUrl,
          project_contract_id: contractRow.id
        }
      });

      if (extractionError) throw extractionError;

      // Handle extraction response
      const extractedData = extractionResult?.data;
      if (extractedData) {
        if (extractedData.document_type !== 'contract') {
          toast.error(`Uploaded document classified as ${extractedData.document_type}. This page only displays contracts.`);
        } else {
          // Update local state with extraction data
          setExtractionData(extractedData);
          
          // Refresh the contract row to get updated data from database
          await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for DB update
          await loadContracts();
          
          // Select the newly uploaded contract to show extracted data
          setTimeout(() => {
            const newContract = contracts.find(c => c.id === contractRow.id);
            if (newContract) {
              setSelectedContract(newContract);
            }
          }, 500);
          
          toast.success(`Contract uploaded and processed with ${Math.round((extractedData.ai_confidence ?? 0) * 100)}% confidence`);
        }
      }

      // Reset form and close dialog
      setSelectedFile(null);
      setContractName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsUploadDialogOpen(false);

    } catch (error) {
      console.error('Upload or extraction error:', error);
      toast.error('Failed to upload or process contract');
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
    try {
      // Delete from database first
      const { error: dbError } = await supabase
        .from('project_contracts')
        .delete()
        .eq('id', contractId);

      if (dbError) throw dbError;

      // Delete from storage
      const filePath = fileName.split('/').slice(-2).join('/'); // Get project_id/filename
      await supabase.storage
        .from('project-contracts')
        .remove([filePath]);

      // Reload contracts
      await loadContracts();
      toast.success('Contract deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete contract');
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
                          disabled={!selectedFile || !contractName.trim() || isUploading}
                          className="flex-1"
                        >
                          {isUploading ? 'Uploading...' : 'Upload'}
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
  const extractedContract = currentData.contract || {};
  const aiSummary = selectedContract.ai_summary_json || {};
  const title = extractedContract.title || aiSummary.title || selectedContract.name;
  
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusBadge(selectedContract.status)}
                  {getConfidenceBadge(Math.round(currentConfidence * 100))}
                </div>
                <p className="text-muted-foreground">Contract management for {project.name}</p>
              </div>
              
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
                              Processing...
                            </>
                          ) : (
                            'Upload'
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" asChild>
                  <a href={selectedContract.file_url} target="_blank" rel="noopener noreferrer">
                    <Eye className="w-4 h-4 mr-2" />
                    View PDF
                  </a>
                </Button>

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
                                >
                                  <Trash2 className="w-3 h-3" />
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
          </div>

          {/* Contract Report Summary */}
          <div className="space-y-8">
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
                     <div className="text-center">
                       <div className="text-sm text-muted-foreground">Contract Sum</div>
                       <div className="text-2xl font-bold">
                         {extractedContract.contract_value || '—'}
                       </div>
                       <div className="text-xs text-muted-foreground">Ex GST</div>
                     </div>
                     <div className="text-center">
                       <div className="text-sm text-muted-foreground">Payment Type</div>
                       <div className="text-lg font-semibold">
                         {extractedContract.payment_terms || '—'}
                       </div>
                     </div>
                     <div className="text-center">
                       <div className="text-sm text-muted-foreground">Deposit</div>
                       <div className="text-lg font-semibold">
                         {percentFrom(extractedContract.payment_terms)}
                       </div>
                     </div>
                     <div className="text-center">
                       <div className="text-sm text-muted-foreground">Retention</div>
                       <div className="text-lg font-semibold">
                         {percentFrom(extractedContract.payment_terms)}
                       </div>
                     </div>
                  </div>
                </div>

                <Separator />

                {/* Parties Information */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 border-b pb-2">Contract Parties</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                       <div className="font-medium text-primary mb-2">Principal</div>
                       <div className="space-y-1">
                         <div className="font-semibold">{extractedContract.parties?.[0] || '—'}</div>
                         <div className="text-sm text-muted-foreground">
                           ABN: —
                         </div>
                       </div>
                     </div>
                     <div>
                       <div className="font-medium text-primary mb-2">Contractor</div>
                       <div className="space-y-1">
                         <div className="font-semibold">{extractedContract.parties?.[1] || '—'}</div>
                         <div className="text-sm text-muted-foreground">
                           ABN: —
                         </div>
                       </div>
                     </div>
                  </div>
                </div>

                <Separator />

                {/* Key Dates & Timeline */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 border-b pb-2">Project Timeline</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div>
                       <div className="font-medium text-muted-foreground mb-1">Start Date</div>
                       <div className="text-lg font-semibold">
                         {extractedContract.effective_date || '—'}
                       </div>
                     </div>
                     <div>
                       <div className="font-medium text-muted-foreground mb-1">Practical Completion</div>
                       <div className="text-lg font-semibold">
                         {extractedContract.expiry_date || '—'}
                       </div>
                     </div>
                     <div>
                       <div className="font-medium text-muted-foreground mb-1">DLP Days</div>
                       <div className="text-lg font-semibold">
                         180 days
                       </div>
                     </div>
                  </div>
                </div>

                <Separator />

                {/* Next Milestone */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 border-b pb-2">Upcoming Milestone</h3>
                  {contractMilestones.length > 0 ? (
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold text-lg">{contractMilestones[0].name}</div>
                          <div className="text-muted-foreground">
                            Due: {new Date(contractMilestones[0].due_date).toLocaleDateString() || '—'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{formatCurrency(contractMilestones[0].amount)}</div>
                        </div>
                      </div>
                      <Button className="w-full" onClick={handleCreateProgressClaim}>
                        Create Progress Claim
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold text-lg">Base Stage</div>
                          <div className="text-muted-foreground">Due: —</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{formatCurrency(90000)}</div>
                        </div>
                      </div>
                      <Button className="w-full" onClick={handleCreateProgressClaim}>
                        Create Progress Claim
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Insurance & Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Insurance & Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Public Liability Insurance", status: "valid", expiry: "2025-06-30" },
                    { name: "Contract Works Insurance", status: "expiring", expiry: "2024-12-31" },
                    { name: "Workers Compensation", status: "valid", expiry: "2025-03-15" }
                  ].map((insurance, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{insurance.name}</div>
                        <div className="text-sm text-muted-foreground">Expires: {insurance.expiry}</div>
                      </div>
                      <Badge variant={insurance.status === 'valid' ? 'default' : 'secondary'}>
                        {insurance.status === 'valid' ? 'Valid' : 'Expiring Soon'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contract Terms & Key Clauses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Gavel className="w-5 h-5" />
                  Key Contract Terms & Clauses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between p-2 border-b">
                      <span className="font-medium">Variations</span>
                      <span className="text-muted-foreground">Clause 12</span>
                    </div>
                    <div className="flex justify-between p-2 border-b">
                      <span className="font-medium">Extensions of Time</span>
                      <span className="text-muted-foreground">Clause 15</span>
                    </div>
                    <div className="flex justify-between p-2 border-b">
                      <span className="font-medium">Liquidated Damages</span>
                      <span className="text-muted-foreground">Clause 18</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between p-2 border-b">
                      <span className="font-medium">Termination</span>
                      <span className="text-muted-foreground">Clause 22</span>
                    </div>
                    <div className="flex justify-between p-2 border-b">
                      <span className="font-medium">Dispute Resolution</span>
                      <span className="text-muted-foreground">Clause 35</span>
                    </div>
                    <div className="flex justify-between p-2 border-b">
                      <span className="font-medium">Governing Law</span>
                      <span className="text-muted-foreground">Victoria, Australia</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Execution & Signatures */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FileSignature className="w-5 h-5" />
                  Contract Execution Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50/50">
                    <div>
                      <div className="font-medium">Principal - John & Jane Example</div>
                      <div className="text-sm text-muted-foreground">Signed on January 15, 2024</div>
                    </div>
                    <Badge variant="default">Executed</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50/50">
                    <div>
                      <div className="font-medium">Contractor - Skrobaki Pty Ltd</div>
                      <div className="text-sm text-muted-foreground">Signed on January 15, 2024</div>
                    </div>
                    <Badge variant="default">Executed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Risk Assessment & Mitigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contractRisks.length > 0 ? (
                  <div className="space-y-4">
                    {contractRisks.map((risk) => (
                      <div key={risk.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium">{risk.risk_description}</div>
                          <Badge variant="outline" className={getRiskLevelColor(risk.risk_level)}>
                            {risk.risk_level.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <strong>Mitigation:</strong> {risk.mitigation_strategy}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium">Weather-related delays</div>
                        <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200">
                          MEDIUM
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <strong>Mitigation:</strong> Monitor weather forecasts and plan activities accordingly. Maintain contingency schedules.
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium">Material supply chain issues</div>
                        <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                          LOW
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <strong>Mitigation:</strong> Early procurement strategies and established supplier agreements in place.
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Items & Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Action Items & Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contractActions.length > 0 ? (
                  <div className="space-y-3">
                    {contractActions.map((action) => (
                      <div key={action.id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                          action.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-muted-foreground'
                        }`}>
                          {action.completed && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{action.action_description}</div>
                          <div className="text-sm text-muted-foreground">
                            Due: {new Date(action.due_date).toLocaleDateString()} • Assigned to: {action.assigned_to}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-5 h-5 rounded border border-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">Submit updated insurance certificates</div>
                        <div className="text-sm text-muted-foreground">
                          Due: August 20, 2024 • Assigned to: Project Manager
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-5 h-5 rounded border bg-green-500 border-green-500 flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Complete contract execution</div>
                        <div className="text-sm text-muted-foreground">
                          Due: August 15, 2024 • Assigned to: Legal Team
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
