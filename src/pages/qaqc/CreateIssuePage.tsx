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

interface CreateIssuePageProps {
  onNavigate: (page: string) => void;
}

export const CreateIssuePage = ({ onNavigate }: CreateIssuePageProps) => {
  const [searchParams] = useSearchParams();
  
  const projectId = searchParams.get('projectId');
  const reportId = searchParams.get('reportId');
  const { getProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    priority: 'medium',
    assigned_to: '',
    due_date: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectId || !project) {
      toast({
        title: "Error",
        description: "Project information is missing",
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

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const issueData = {
        project_id: projectId,
        company_id: project.company_id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        priority: formData.priority,
        location: null, // Not needed for project-specific issues
        assigned_to: formData.assigned_to.trim() || null,
        due_date: formData.due_date || null,
        created_by: userData.user?.id || null,
        status: 'open',
        report_id: reportId || null,
        issue_number: '',
        attachments: [], // Will be updated after creating issue if there are attachments
      };

      const { data: newIssue, error } = await supabase
        .from('issues')
        .insert(issueData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Upload attachments if any
      if (attachments.length > 0 && newIssue) {
        const uploadedAttachments = [];
        
        for (const file of attachments) {
          try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${newIssue.id}/${fileName}`;

            const { data, error: uploadError } = await supabase.storage
              .from('issue-attachments')
              .upload(filePath, file);

            if (uploadError) throw uploadError;

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
          } catch (uploadError) {
            console.error('Error uploading file:', file.name, uploadError);
          }
        }
        
        // Update issue with attachments
        if (uploadedAttachments.length > 0) {
          await supabase
            .from('issues')
            .update({ attachments: uploadedAttachments })
            .eq('id', newIssue.id);
        }
      }

      toast({
        title: "Success",
        description: "Issue created successfully",
      });

      // Navigate back to the report's Issue List if creating within a report; otherwise go to project Issues tab
      if (reportId) {
        onNavigate(`qaqc-issue-report-detail?projectId=${projectId}&reportId=${reportId}`);
      } else {
        onNavigate(`project-qaqc?projectId=${projectId}&tab=issues`);
      }
      
    } catch (error) {
      console.error('Error creating issue:', error);
      toast({
        title: "Error",
        description: "Failed to create issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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

  // Remove the automatic paste event listener since we're using button click now

  const handleBack = () => {
    if (reportId) {
      onNavigate(`qaqc-issue-report-detail?projectId=${projectId}&reportId=${reportId}`);
    } else {
      onNavigate(`project-qaqc?projectId=${projectId}&tab=issues`);
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The requested project could not be found.</p>
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

      <div className="flex-1 ml-48 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                {reportId ? 'Back to Report' : 'Back to Issues'}
              </Button>
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h1 className="text-xl font-bold text-foreground">Create New Issue</h1>
            </div>

            <Card className="max-w-5xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Issue Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Form Fields - Compact Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="title" className="text-sm">Issue Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter issue title"
                        required
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="category" className="text-sm">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger className="h-9">
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

                    <div className="space-y-1">
                      <Label htmlFor="priority" className="text-sm">Priority</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger className="h-9">
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

                    <div className="space-y-1">
                      <Label htmlFor="assigned_to" className="text-sm">Assigned To</Label>
                      <Input
                        id="assigned_to"
                        value={formData.assigned_to}
                        onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                        placeholder="Enter assignee name"
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="due_date" className="text-sm">Due Date</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => handleInputChange('due_date', e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>

                  {/* Description - Full Width */}
                  <div className="space-y-1">
                    <Label htmlFor="description" className="text-sm">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter detailed description of the issue"
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* Attachments Section - Compact */}
                  <div className="space-y-3">
                    <Label className="text-sm">Attachments</Label>
                    
                    {/* Upload Actions - Inline */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1 h-8"
                      >
                        <Paperclip className="w-3 h-3" />
                        Browse Files
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handlePasteFromClipboard}
                        className="flex items-center gap-1 h-8"
                      >
                        <Paperclip className="w-3 h-3" />
                        Paste Files
                      </Button>
                    </div>

                    {/* Compact Drag & Drop Zone */}
                    <div
                      ref={dropZoneRef}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`
                        border-2 border-dashed rounded-lg p-4 text-center transition-colors
                        ${isDragOver 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                        }
                      `}
                    >
                      <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className={`text-sm font-medium mb-1 ${isDragOver ? 'text-primary' : 'text-foreground'}`}>
                        {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supports images, documents up to 10MB
                      </p>
                    </div>

                    {/* File Previews - Compact */}
                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">Attachments ({attachments.length})</Label>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          {attachments.map((file, index) => {
                            const isImage = file.type.startsWith('image/');
                            const fileUrl = URL.createObjectURL(file);
                            
                            return (
                              <div
                                key={index}
                                className="relative group border rounded-lg p-2 bg-card hover:shadow-sm transition-shadow"
                              >
                                {/* Remove button */}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAttachment(index)}
                                  className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground"
                                >
                                  <X className="w-2 h-2" />
                                </Button>
                                
                                 {/* File preview */}
                                 <div className="space-y-1">
                                   {isImage ? (
                                     <div className="relative">
                                       <img
                                         src={fileUrl}
                                         alt={file.name}
                                         className="w-full h-20 object-cover rounded border"
                                         onLoad={() => URL.revokeObjectURL(fileUrl)}
                                       />
                                     </div>
                                   ) : (
                                     <div className="flex items-center justify-center h-20 bg-muted rounded border">
                                       <Paperclip className="w-6 h-6 text-muted-foreground" />
                                     </div>
                                   )}
                                   
                                   {/* File info */}
                                   <div className="space-y-1">
                                     <p className="text-xs font-medium text-foreground truncate" title={file.name}>
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

                     {/* Hidden file input */}
                     <input
                       ref={fileInputRef}
                       type="file"
                       multiple
                       className="hidden"
                       onChange={(e) => handleFileSelect(e.target.files)}
                       accept="image/*,application/pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
                     />
                   </div>

                   <div className="flex justify-end gap-2 pt-4">
                     <Button type="button" variant="outline" size="sm" onClick={handleBack}>
                       Cancel
                     </Button>
                     <Button type="submit" disabled={isSubmitting} size="sm">
                       <Save className="w-3 h-3 mr-1" />
                       {isSubmitting ? 'Creating...' : 'Create Issue'}
                     </Button>
                   </div>
                 </form>
               </CardContent>
             </Card>
           </div>
         </div>
       </div>
     </div>
   );
 };