import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, Download, Trash2, X, Eye, History, AlertTriangle, CheckCircle, Clock, AlertCircle, DollarSign, Calendar, Users, FileSignature, Shield, Gavel, ExternalLink } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        .order('version_number', { ascending: false });

      if (error) throw error;
      setContractVersions(data || []);
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
      setContractRisks(data || []);
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
    try {
      // Upload file to Supabase Storage
      const fileName = `${project.id}/${Date.now()}-${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-contracts')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-contracts')
        .getPublicUrl(fileName);

      // Save contract metadata to database
      const { data, error } = await supabase
        .from('project_contracts')
        .insert({
          project_id: project.id,
          name: contractName.trim(),
          file_url: publicUrl,
          file_path: fileName,
          file_size: selectedFile.size,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Reload contracts
      await loadContracts();

      // Reset form and close dialog
      setSelectedFile(null);
      setContractName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsUploadDialogOpen(false);

      toast.success('Contract uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload contract');
    } finally {
      setIsUploading(false);
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

  const contractData = selectedContract.contract_data || {};
  const aiSummary = selectedContract.ai_summary_json || {};
  const title = aiSummary.title || selectedContract.name;

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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusBadge(selectedContract.status)}
                  {getConfidenceBadge(selectedContract.confidence)}
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
                          disabled={!selectedFile || !contractName.trim() || isUploading}
                          className="flex-1"
                        >
                          {isUploading ? 'Uploading...' : 'Upload'}
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
                      {contractVersions.map((version) => (
                        <Card key={version.id} className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium">Version {version.version_number}</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(version.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(version.status)}
                              {getConfidenceBadge(version.confidence)}
                              {version.is_canonical && (
                                <Badge variant="outline" className="text-xs">Canonical</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <a href={version.file_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Open PDF
                              </a>
                            </Button>
                            {!version.is_canonical && (
                              <Button size="sm" variant="outline">
                                Set Canonical
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              Compare
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Facts Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Key Facts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Payment Type</Label>
                    <p className="font-medium">{contractData.payment_type || "Progress"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Contract Sum</Label>
                    <p className="font-medium">{formatCurrency(contractData.contract_sum || 50000)}</p>
                    <p className="text-xs text-muted-foreground">
                      {contractData.gst_included ? "GST Included" : "Ex GST"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Deposit</Label>
                    <p className="font-medium">{contractData.deposit_percentage || 5}%</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Retention</Label>
                    <p className="font-medium">{contractData.retention_percentage || 10}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parties Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Parties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Principal</Label>
                  <p className="font-medium">{contractData.principal_name || "John & Jane Example"}</p>
                  <p className="text-sm text-muted-foreground">ABN: {contractData.principal_abn || "—"}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Contractor</Label>
                  <p className="font-medium">{contractData.contractor_name || "Skrobaki Pty Ltd"}</p>
                  <p className="text-sm text-muted-foreground">ABN: {contractData.contractor_abn || "12 345 678 901"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Dates Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Key Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                    <p className="font-medium">{contractData.start_date || "—"}</p>
                  </div>
                  <div className="flex justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Practical Completion</Label>
                    <p className="font-medium">{contractData.practical_completion || "—"}</p>
                  </div>
                  <div className="flex justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">DLP Days</Label>
                    <p className="font-medium">{contractData.dlp_days || 180}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Milestone Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Next Milestone
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contractMilestones.length > 0 ? (
                  <div className="space-y-4">
                    {contractMilestones.slice(0, 1).map((milestone) => (
                      <div key={milestone.id}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{milestone.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Due: {new Date(milestone.due_date).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="font-medium">{formatCurrency(milestone.amount)}</p>
                        </div>
                        <Button onClick={handleCreateProgressClaim} className="w-full">
                          Create Progress Claim
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">Base Stage</h4>
                        <p className="text-sm text-muted-foreground">
                          Due: —
                        </p>
                      </div>
                      <p className="font-medium">{formatCurrency(90000)}</p>
                    </div>
                    <Button onClick={handleCreateProgressClaim} className="w-full">
                      Create Progress Claim
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Insurances Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Insurances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Public Liability", status: "ok", expiry: "2025-06-30" },
                    { name: "Workers Compensation", status: "expiring", expiry: "2025-02-15" },
                    { name: "Professional Indemnity", status: "ok", expiry: "2025-12-31" }
                  ].map((insurance, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{insurance.name}</p>
                        <p className="text-xs text-muted-foreground">Expires: {insurance.expiry}</p>
                      </div>
                      <Badge 
                        variant={insurance.status === 'ok' ? 'default' : 'secondary'}
                        className={insurance.status === 'expiring' ? 'text-yellow-700 bg-yellow-100' : ''}
                      >
                        {insurance.status === 'ok' ? 'Valid' : 'Expiring Soon'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Clauses Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="w-5 h-5" />
                  Key Clauses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { clause: "Variations", reference: "Clause 12" },
                    { clause: "Extensions of Time", reference: "Clause 15" },
                    { clause: "Liquidated Damages", reference: "Clause 18" },
                    { clause: "Termination", reference: "Clause 22" },
                    { clause: "Dispute Resolution", reference: "Clause 25" },
                    { clause: "Governing Law", reference: "Clause 28" }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <p className="font-medium">{item.clause}</p>
                      <Badge variant="outline">{item.reference}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Signatures Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="w-5 h-5" />
                  Signatures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Principal</p>
                      <p className="text-sm text-muted-foreground">Signed: 2024-01-15</p>
                    </div>
                    <Badge variant="default">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Signed
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Contractor</p>
                      <p className="text-sm text-muted-foreground">Pending signature</p>
                    </div>
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      Missing
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risks Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contractRisks.length > 0 ? (
                  <div className="space-y-3">
                    {contractRisks.slice(0, 3).map((risk) => (
                      <div key={risk.id} className={`p-3 rounded-lg border ${getRiskLevelColor(risk.risk_level)}`}>
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-sm">{risk.risk_description}</p>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getRiskLevelColor(risk.risk_level)}`}
                          >
                            {risk.risk_level.toUpperCase()}
                          </Badge>
                        </div>
                        {risk.mitigation_strategy && (
                          <p className="text-xs opacity-80">{risk.mitigation_strategy}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg border text-yellow-600 bg-yellow-50 border-yellow-200">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium text-sm">Retention 10% — confirm staged release.</p>
                        <Badge variant="outline" className="text-xs text-yellow-600 bg-yellow-50 border-yellow-200">
                          MEDIUM
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="w-5 h-5" />
                  Next Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contractActions.length > 0 ? (
                  <div className="space-y-3">
                    {contractActions.slice(0, 4).map((action) => (
                      <div key={action.id} className="flex items-start gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 mt-0.5 ${
                          action.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-muted-foreground'
                        }`} />
                        <div className="flex-1">
                          <p className={`font-medium text-sm ${action.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {action.action_description}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-muted-foreground">
                              Due: {new Date(action.due_date).toLocaleDateString()}
                            </p>
                            {action.assigned_to && (
                              <p className="text-xs text-muted-foreground">
                                Assigned: {action.assigned_to}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No pending actions</p>
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
