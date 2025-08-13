import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Download, Trash2, X } from "lucide-react";
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
}

export const ProjectContractsPage = ({ project, onNavigate }: ProjectContractsPageProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [contracts, setContracts] = useState<ContractFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contractName, setContractName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing contracts
  useEffect(() => {
    loadContracts();
  }, [project.id]);

  const loadContracts = async () => {
    try {
      const { data, error } = await (supabase as any)
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
        file_size: contract.file_size
      }));

      setContracts(formattedContracts);
    } catch (error) {
      console.error('Error loading contracts:', error);
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
      const { data, error } = await (supabase as any)
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

      // Reset form
      setSelectedFile(null);
      setContractName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

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
      const { error: dbError } = await (supabase as any)
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

  return (
    <div className="h-screen flex bg-background">
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
      <div className="flex-1 ml-48 h-screen overflow-y-auto bg-background">
        <div className="p-6 min-h-full">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Project Contracts</h1>
                <p className="text-slate-600">Upload and manage contracts for {project.name}</p>
              </div>
              <Button
                onClick={() => setIsAddTaskDialogOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Contract
              </Button>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Left Content - Upload Form */}
            <div className="flex-1 space-y-6">
              {/* Upload Section */}
              <Card className="border border-border shadow-sm bg-card">
                <CardHeader>
                  <CardTitle className="text-xl font-playfair text-card-foreground">Upload New Contract</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Contract Name Input */}
                  <div className="space-y-2">
                    <Label htmlFor="contract-name" className="text-sm font-medium text-card-foreground">Contract Name</Label>
                    <Input
                      id="contract-name"
                      type="text"
                      value={contractName}
                      onChange={(e) => setContractName(e.target.value)}
                      placeholder="Enter contract name"
                      className="bg-input border-input"
                    />
                  </div>

                  {/* Drag & Drop Upload Area */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-card-foreground">PDF Document</Label>
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                        dragActive 
                          ? "border-primary bg-primary/5 shadow-md" 
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
                      
                      <h3 className="text-lg font-semibold text-card-foreground mb-2">
                        {dragActive ? "Drop your PDF here" : "Drop PDF file here"}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4">
                        or click to browse and select a file
                      </p>
                      
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Browse Files
                      </Button>
                    </div>
                  </div>

                  {/* Selected File Display */}
                  {selectedFile && (
                    <div className="bg-muted/30 rounded-lg p-4 flex items-center justify-between border">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-red-500" />
                        <div>
                          <p className="font-medium text-card-foreground">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
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
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || !contractName.trim() || isUploading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload Contract'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar - Files List */}
            <div className="w-80">
              <Card className="border border-border shadow-sm bg-card h-fit sticky top-6">
                <CardHeader>
                  <CardTitle className="text-xl font-playfair text-card-foreground">Uploaded Files</CardTitle>
                </CardHeader>
                <CardContent>
                  {contracts.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="bg-muted/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-card-foreground mb-2">No files uploaded</h3>
                      <p className="text-sm text-muted-foreground">Upload your first contract to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {contracts.map((contract) => (
                        <div key={contract.id} className="bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-all duration-300 group border">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="bg-background rounded-lg p-2 shadow-sm flex-shrink-0">
                                <FileText className="w-5 h-5 text-red-500" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium text-card-foreground text-sm leading-tight truncate group-hover:text-primary transition-colors">
                                  {contract.name}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatFileSize(contract.file_size)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(contract.uploaded_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(contract.file_url, '_blank')}
                                className="h-6 px-2 text-xs"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(contract.id, contract.file_url)}
                                className="h-6 px-2 text-xs border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/40"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};