import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Eye, Trash2, Upload, X, File, Image as ImageIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useProjectDocuments } from '@/hooks/useProjectDocuments';
import { DocumentEditDialog } from './DocumentEditDialog';
import type { ProjectDocument } from '@/hooks/useProjectDocuments';
import { Progress } from '@/components/ui/progress';
import { useSearchParams } from 'react-router-dom';
import { useProjects, Project } from '@/hooks/useProjects';

interface ProjectDocsPageProps {
  onNavigate?: (page: string) => void;
}

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
}

export const ProjectDocsPage: React.FC<ProjectDocsPageProps> = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { toast } = useToast();
  const { getProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ProjectDocument | null>(null);

  useEffect(() => {
    if (projectId) {
      getProject(projectId).then(setProject);
    }
  }, [projectId]);

  const {
    documents,
    loading: documentsLoading,
    deleteDocument,
    refetch: refetchDocuments,
  } = useProjectDocuments(projectId || '');

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !projectId) return;

    const newFiles: UploadFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending',
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);
    
    // Start uploading all files
    newFiles.forEach(uploadFile => handleUpload(uploadFile));
  };

  const handleUpload = async (uploadFile: UploadFile) => {
    if (!projectId) return;

    setUploadFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? { ...f, status: 'uploading' } : f
    ));

    try {
      const fileName = `${Date.now()}-${uploadFile.file.name}`;
      const filePath = `project-documents/${projectId}/${fileName}`;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { 
            ...f, 
            progress: Math.min(f.progress + Math.random() * 30, 90) 
          } : f
        ));
      }, 200);

      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, uploadFile.file);

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      // Insert into database
      const { error: dbError } = await supabase
        .from('project_documents')
        .insert({
          project_id: projectId,
          name: uploadFile.file.name,
          file_url: urlData.publicUrl,
          content_type: uploadFile.file.type,
          file_size: uploadFile.file.size,
          document_type: 'document',
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (dbError) throw dbError;

      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, progress: 100, status: 'complete' } : f
      ));

      toast({
        title: 'Success',
        description: `${uploadFile.file.name} uploaded successfully`,
      });

      refetchDocuments();

    } catch (error) {
      console.error('Upload error:', error);
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'error', progress: 0 } : f
      ));

      toast({
        title: 'Error',
        description: `Failed to upload ${uploadFile.file.name}`,
        variant: 'destructive',
      });
    }
  };

  const removeUploadFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDocumentClick = (doc: ProjectDocument) => {
    setSelectedDocument(doc);
    setEditDialogOpen(true);
  };

  const handleStatusChange = async (documentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('project_documents')
        .update({ document_status: newStatus })
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Document status updated',
      });

      refetchDocuments();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update document status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await deleteDocument(documentId);
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <ImageIcon className="w-5 h-5 text-primary" />;
    }
    return <FileText className="w-5 h-5 text-primary" />;
  };

  if (!projectId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No project selected</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Simple Header */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="px-6 h-[72px] flex items-center justify-between pt-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-inter">
              {project?.name || 'Project Documents'}
            </h1>
            <p className="text-sm text-muted-foreground">Documents</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Upload Area */}
          <Card className="border-2 border-dashed">
            <div
              className={`p-8 text-center transition-colors cursor-pointer ${
                isDragging 
                  ? 'bg-primary/5 border-primary' 
                  : 'hover:bg-accent/30'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop files here or click to browse
              </p>
              <Button variant="outline" size="sm">
                <Upload className="w-3 h-3 mr-2" />
                Select Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dwg,.txt,.csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>
          </Card>

          {/* Upload Progress */}
          {uploadFiles.length > 0 && (
            <Card>
              <div className="p-4">
                <h4 className="font-semibold mb-4">Uploading Files</h4>
                <div className="space-y-3">
                  {uploadFiles.map(file => (
                    <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      {getFileIcon(file.file.name)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.file.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={file.progress} className="flex-1 h-2" />
                          <span className="text-xs text-muted-foreground min-w-[45px]">
                            {file.progress}%
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUploadFile(file.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Documents List */}
          <Card>
            <div className="p-4 border-b">
              <h3 className="font-semibold text-lg">
                Documents ({documents.length})
              </h3>
            </div>
            
            {documentsLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading documents...
              </div>
            ) : documents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No documents uploaded yet
              </div>
            ) : (
              <div className="divide-y">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {getFileIcon(doc.name)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p 
                        className="font-medium text-sm truncate cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleDocumentClick(doc)}
                      >
                        {doc.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.file_size || 0)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Select
                        value={doc.document_status || ''}
                        onValueChange={(value) => handleStatusChange(doc.id, value)}
                      >
                        <SelectTrigger className="h-8 w-[180px] text-xs">
                          <SelectValue placeholder="Set status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Issue for Review">Issue for Review</SelectItem>
                          <SelectItem value="Issue for Approval">Issue for Approval</SelectItem>
                          <SelectItem value="Issue for Construction">Issue for Construction</SelectItem>
                          <SelectItem value="Issue for Use">Issue for Use</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => window.open(doc.file_url, '_blank')}
                        title="View file"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleDownload(doc.file_url, doc.name)}
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDeleteDocument(doc.id)}
                        title="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <DocumentEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        document={selectedDocument}
        onDocumentUpdated={refetchDocuments}
        onDelete={deleteDocument}
      />
    </div>
  );
};