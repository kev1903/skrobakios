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
    location: '',
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
        location: formData.location.trim() || null,
        assigned_to: formData.assigned_to.trim() || null,
        due_date: formData.due_date || null,
        created_by: userData.user?.id || null,
        status: 'open',
        report_id: reportId || null,
        issue_number: '',
      };

      const { error } = await supabase
        .from('issues')
        .insert(issueData);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Issue created successfully",
      });

      // Navigate back to report detail if reportId exists, otherwise to QA/QC tab
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
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).filter(file => {
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

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const files = e.clipboardData?.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
      toast({
        title: "Files pasted",
        description: `${files.length} file(s) added from clipboard`,
      });
    }
  }, [handleFileSelect, toast]);

  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

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

      <div className="flex-1 ml-48 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {reportId ? 'Back to Report' : 'Back to Issues'}
              </Button>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h1 className="text-2xl font-bold text-foreground">Create New Issue</h1>
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
                      onClick={() => {
                        navigator.clipboard.read().then(() => {
                          toast({
                            title: "Paste Ready",
                            description: "Use Ctrl+V to paste files from clipboard",
                          });
                        }).catch(() => {
                          toast({
                            title: "Paste Tip",
                            description: "Copy files and use Ctrl+V to paste them here",
                          });
                        });
                      }}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Paste Files
                    </Button>
                  </div>

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

                  {/* File List */}
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Selected Files ({attachments.length})</Label>
                      <div className="grid gap-2">
                        {attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg border"
                          >
                            <div className="flex items-center gap-3">
                              <Paperclip className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium text-foreground">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
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

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Creating...' : 'Create Issue'}
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