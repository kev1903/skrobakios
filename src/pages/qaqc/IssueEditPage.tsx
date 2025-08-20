import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';
import { ArrowLeft, Save, AlertTriangle, Upload, Paperclip, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IssueEditPageProps {
  onNavigate: (page: string) => void;
}

export const IssueEditPage = ({ onNavigate }: IssueEditPageProps) => {
  const [searchParams] = useSearchParams();
  
  const projectId = searchParams.get('projectId');
  const issueId = searchParams.get('issueId');
  const { getProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    priority: 'medium',
    location: '',
    assigned_to: '',
    due_date: '',
    status: 'open'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (projectId) {
      const fetchProject = async () => {
        try {
          const fetchedProject = await getProject(projectId);
          setProject(fetchedProject);
        } catch (error) {
          console.error('Failed to fetch project:', error);
        }
      };
      fetchProject();
    }
  }, [projectId, getProject]);

  useEffect(() => {
    if (issueId) {
      const fetchIssue = async () => {
        try {
          const { data: issue, error } = await supabase
            .from('issues')
            .select('*')
            .eq('id', issueId)
            .single();

          if (error) throw error;

          if (issue) {
            setFormData({
              title: issue.title || '',
              description: issue.description || '',
              category: issue.category || 'General',
              priority: issue.priority || 'medium',
              location: issue.location || '',
              assigned_to: issue.assigned_to || '',
              due_date: issue.due_date || '',
              status: issue.status || 'open'
            });
            
            // Load existing attachments
            if (issue.attachments && Array.isArray(issue.attachments)) {
              setExistingAttachments(issue.attachments);
            }
          }
        } catch (error) {
          console.error('Failed to fetch issue:', error);
          toast({
            title: "Error",
            description: "Failed to load issue details",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchIssue();
    }
  }, [issueId, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const uploadAttachments = async (files: File[]): Promise<any[]> => {
    if (!issueId || files.length === 0) return [];
    
    const uploadedAttachments = [];
    
    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${issueId}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('issue-attachments')
          .upload(filePath, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('issue-attachments')
          .getPublicUrl(filePath);

        uploadedAttachments.push({
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: urlData.publicUrl,
          path: filePath,
          uploaded_at: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error uploading file:', file.name, error);
        toast({
          title: "Upload Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }
    
    return uploadedAttachments;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectId || !project || !issueId) {
      toast({
        title: "Error",
        description: "Missing required information",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Issue title is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);

    try {
      // Upload new attachments first
      const newUploadedAttachments = await uploadAttachments(attachments);
      
      // Combine existing and new attachments
      const allAttachments = [...existingAttachments, ...newUploadedAttachments];
      
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        priority: formData.priority,
        location: formData.location.trim() || null,
        assigned_to: formData.assigned_to.trim() || null,
        due_date: formData.due_date || null,
        status: formData.status,
        attachments: allAttachments,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('issues')
        .update(updateData)
        .eq('id', issueId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Issue updated successfully",
      });

      // Navigate back to Issues list page after save
      onNavigate(`project-qaqc?projectId=${projectId}&tab=issues`);
      
    } catch (error) {
      console.error('Error updating issue:', error);
      toast({
        title: "Error",
        description: "Failed to update issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  // File upload handlers
  const handleFileSelect = useCallback((files: FileList | File[] | null) => {
    if (!files) return;
    
    const fileArray = Array.isArray(files) ? files : Array.from(files);
    const newFiles = fileArray.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });
    
    setAttachments(prev => [...prev, ...newFiles]);
  }, [toast]);

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
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      const files: File[] = [];
      
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const file = new File([blob], `pasted-image-${Date.now()}.${type.split('/')[1]}`, { type });
            files.push(file);
          }
        }
      }
      
      if (files.length > 0) {
        handleFileSelect(files);
        toast({
          title: "Files pasted",
          description: `${files.length} file(s) added from clipboard`,
        });
      } else {
        toast({
          title: "No files found",
          description: "No files found in clipboard. Copy an image and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error accessing clipboard:', error);
      toast({
        title: "Clipboard access failed",
        description: "Unable to access clipboard. Please try dragging and dropping files instead.",
        variant: "destructive"
      });
    }
  }, [handleFileSelect, toast]);

  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeExistingAttachment = useCallback(async (attachment: any) => {
    try {
      // Remove from storage
      if (attachment.path) {
        const { error: storageError } = await supabase.storage
          .from('issue-attachments')
          .remove([attachment.path]);
        
        if (storageError) {
          console.error('Error removing file from storage:', storageError);
        }
      }
      
      // Remove from state
      setExistingAttachments(prev => prev.filter(a => a.id !== attachment.id));
      
      toast({
        title: "File removed",
        description: `${attachment.name} has been removed`,
      });
    } catch (error) {
      console.error('Error removing attachment:', error);
      toast({
        title: "Error",
        description: "Failed to remove attachment",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleBack = () => {
    onNavigate(`qaqc-issue-detail?projectId=${projectId}&issueId=${issueId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Loading issue details</p>
        </div>
      </div>
    );
  }

  if (!project || !issueId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Issue Not Found</h2>
          <p className="text-gray-600 mb-4">The requested issue could not be found.</p>
          <Button onClick={() => onNavigate('projects')}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={() => "bg-blue-100 text-blue-800"}
        getStatusText={() => "Active"}
        activeSection="qaqc"
      />

      <div className="flex-1 ml-48 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Issue Details
              </Button>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h1 className="text-2xl font-bold text-foreground">Edit Issue</h1>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Issue Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter issue title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Safety">Safety</SelectItem>
                        <SelectItem value="Quality">Quality</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Construction">Construction</SelectItem>
                        <SelectItem value="Environmental">Environmental</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Enter location"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assigned_to">Assigned To</Label>
                    <Input
                      id="assigned_to"
                      value={formData.assigned_to}
                      onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                      placeholder="Enter assignee name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => handleInputChange('due_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter detailed description of the issue"
                    rows={4}
                  />
                </div>

                {/* File Upload Section */}
                <div className="space-y-4">
                  <Label>Attachments</Label>
                  
                  {/* Upload Actions */}
                  <div className="flex gap-2 mb-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Paperclip className="w-4 h-4" />
                      Browse Files
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePasteFromClipboard}
                      className="flex items-center gap-2"
                    >
                      <Paperclip className="w-4 h-4" />
                      Paste Files
                    </Button>
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />

                  {/* Drag & Drop Zone */}
                  <div
                    ref={dropZoneRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      border-2 border-dashed rounded-lg p-8 text-center transition-colors
                      ${isDragOver 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                      }
                    `}
                  >
                    <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className={`text-lg font-medium mb-2 ${isDragOver ? 'text-primary' : 'text-foreground'}`}>
                      {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or use the buttons above to browse or paste files
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supports images, documents, and other files up to 10MB
                    </p>
                  </div>

                  {/* File Previews */}
                  {(existingAttachments.length > 0 || attachments.length > 0) && (
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">
                        Attachments ({existingAttachments.length + attachments.length})
                      </Label>
                      
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Existing Attachments */}
                        {existingAttachments.map((attachment) => {
                          const isImage = attachment.type?.startsWith('image/') || attachment.name?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
                          
                          return (
                            <div
                              key={attachment.id}
                              className="relative group border rounded-lg p-3 bg-card hover:shadow-md transition-shadow"
                            >
                              {/* Remove button */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExistingAttachment(attachment)}
                                className="absolute top-1 right-1 h-7 w-7 p-0 opacity-70 hover:opacity-100 transition-opacity bg-destructive/90 hover:bg-destructive text-destructive-foreground hover:text-destructive-foreground shadow-sm z-10"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                              
                              {/* File preview */}
                              <div className="space-y-2">
                                {isImage ? (
                                  <div className="relative">
                                    <img
                                      src={attachment.url}
                                      alt={attachment.name}
                                      className="w-full h-32 object-cover rounded border"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center h-32 bg-muted rounded border">
                                    <Paperclip className="w-8 h-8 text-muted-foreground" />
                                  </div>
                                )}
                                
                                {/* File info */}
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-foreground truncate" title={attachment.name}>
                                    {attachment.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {attachment.size ? `${(attachment.size / 1024 / 1024).toFixed(2)} MB` : 'Existing file'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* New Attachments */}
                        {attachments.map((file, index) => {
                          const isImage = file.type.startsWith('image/');
                          const fileUrl = URL.createObjectURL(file);
                          
                          return (
                            <div
                              key={index}
                              className="relative group border rounded-lg p-3 bg-card hover:shadow-md transition-shadow"
                            >
                              {/* Remove button */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAttachment(index)}
                                className="absolute top-1 right-1 h-7 w-7 p-0 opacity-70 hover:opacity-100 transition-opacity bg-destructive/90 hover:bg-destructive text-destructive-foreground hover:text-destructive-foreground shadow-sm z-10"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                              
                              {/* File preview */}
                              <div className="space-y-2">
                                {isImage ? (
                                  <div className="relative">
                                    <img
                                      src={fileUrl}
                                      alt={file.name}
                                      className="w-full h-32 object-cover rounded border"
                                      onLoad={() => URL.revokeObjectURL(fileUrl)}
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center h-32 bg-muted rounded border">
                                    <Paperclip className="w-8 h-8 text-muted-foreground" />
                                  </div>
                                )}
                                
                                {/* File info */}
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-foreground truncate" title={file.name}>
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || isUploading}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? (isUploading ? 'Uploading files...' : 'Updating...') : 'Update Issue'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};