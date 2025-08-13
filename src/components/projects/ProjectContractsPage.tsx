import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/hooks/useProjects";

interface ProjectContractsPageProps {
  project: Project;
}

interface ContractFile {
  id: string;
  name: string;
  file_url: string;
  uploaded_at: string;
  file_size: number;
}

export const ProjectContractsPage = ({ project }: ProjectContractsPageProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [contracts, setContracts] = useState<ContractFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contractName, setContractName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing contracts
  useEffect(() => {
    loadContracts();
  }, [project.id]);

  const loadContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('project_contracts')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedContracts = (data || []).map(contract => ({
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

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-playfair font-bold text-gray-900">Project Contracts</h1>
        <p className="text-gray-600 mt-1">Upload and manage contracts for {project.name}</p>
      </div>

      {/* Upload Section */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="font-playfair text-gray-900">Upload New Contract</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contract-name" className="text-gray-700">Contract Name</Label>
            <Input
              id="contract-name"
              type="text"
              value={contractName}
              onChange={(e) => setContractName(e.target.value)}
              placeholder="Enter contract name"
              className="border-gray-300 focus:border-blue-500 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract-file" className="text-gray-700">PDF File</Label>
            <div className="flex items-center gap-4">
              <Input
                ref={fileInputRef}
                id="contract-file"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="border-gray-300 focus:border-blue-500 bg-white"
              />
              {selectedFile && (
                <span className="text-sm text-gray-600">
                  {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </span>
              )}
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !contractName.trim() || isUploading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload Contract'}
          </Button>
        </CardContent>
      </Card>

      {/* Contracts List */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="font-playfair text-gray-900">Uploaded Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No contracts uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-red-500" />
                    <div>
                      <h3 className="font-medium text-gray-900">{contract.name}</h3>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(contract.file_size)} • {new Date(contract.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(contract.file_url, '_blank')}
                      className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(contract.id, contract.file_url)}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};