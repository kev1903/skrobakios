import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';
import { ArrowLeft, Save, AlertTriangle, Upload, Paperclip, X, FileText, Download } from 'lucide-react';
import { useIssueReport } from '@/hooks/useQAQCData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IssueReportEditPageProps {
  onNavigate: (page: string) => void;
}

interface AttachmentType {
  id: string | number;
  name: string;
  size?: number;
  type?: string;
  url?: string;
  path?: string;
  uploaded_at?: string;
  [key: string]: any; // Add index signature for JSON compatibility
}

export const IssueReportEditPage = ({ onNavigate }: IssueReportEditPageProps) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const reportId = searchParams.get('reportId');
  const { getProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const { data: report } = useIssueReport(reportId || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    status: 'active',
    description: ''
  });

  // Attachment state
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<AttachmentType[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (projectId) {
      getProject(projectId).then(setProject).catch(console.error);
    }
  }, [projectId, getProject]);

  useEffect(() => {
    if (report) {
      setFormData({
        title: report.title || '',
        status: report.status || 'active',
        description: report.description || ''
      });

      // Load existing attachments
      if (report.attachments && Array.isArray(report.attachments)) {
        const attachmentsWithUrls = report.attachments.map((attachment: any) => {
          const attachmentObj = attachment as AttachmentType;
          
          // Generate public URL if needed
          let publicUrl = attachmentObj.url;
          if (attachmentObj.path) {
            const { data: urlData } = supabase.storage
              .from('issue-report-attachments')
              .getPublicUrl(attachmentObj.path);
            publicUrl = urlData.publicUrl;
          } else if (attachmentObj.url && !attachmentObj.url.startsWith('http')) {
            const { data: urlData } = supabase.storage
              .from('issue-report-attachments') 
              .getPublicUrl(attachmentObj.url);
            publicUrl = urlData.publicUrl;
          }
          
          return {
            ...attachmentObj,
            url: publicUrl
          };
        });
        setExistingAttachments(attachmentsWithUrls);
      }
    }
  }, [report]);

  const handleBack = () => onNavigate(`qaqc-issue-report-detail?projectId=${projectId}&reportId=${reportId}`);

  // Attachment handlers
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const deleteExistingAttachment = async (attachment: AttachmentType) => {
    try {
      // Remove from storage if path exists
      if (attachment.path) {
        await supabase.storage
          .from('issue-report-attachments')
          .remove([attachment.path]);
      }

      // Update the report's attachments array
      const updatedAttachments = existingAttachments.filter(a => a.id !== attachment.id);
      const { error } = await supabase
        .from('issue_reports')
        .update({
          attachments: updatedAttachments,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      setExistingAttachments(updatedAttachments);
      
      toast({
        title: "Success",
        description: "Attachment deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast({
        title: "Error",
        description: "Failed to delete attachment",
        variant: "destructive"
      });
    }
  };

  const uploadAttachments = async () => {
    if (attachments.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedAttachments = [];

      for (const file of attachments) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${reportId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('issue-report-attachments')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('issue-report-attachments')
          .getPublicUrl(fileName);

        uploadedAttachments.push({
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: urlData.publicUrl,
          path: fileName,
          uploaded_at: new Date().toISOString()
        });
      }

      // Update the report with new attachments
      const allAttachments = [...existingAttachments, ...uploadedAttachments];
      const { error } = await supabase
        .from('issue_reports')
        .update({
          attachments: allAttachments,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      setExistingAttachments(allAttachments);
      setAttachments([]);

      toast({
        title: "Success",
        description: `${uploadedAttachments.length} attachment(s) uploaded successfully`
      });
    } catch (error) {
      console.error('Error uploading attachments:', error);
      toast({
        title: "Error", 
        description: "Failed to upload attachments",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSave = async () => {
    if (!reportId || !formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Upload new attachments first if any
      if (attachments.length > 0) {
        await uploadAttachments();
      }

      const { error } = await supabase
        .from('issue_reports')
        .update({
          title: formData.title.trim(),
          status: formData.status,
          description: formData.description.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Issue report updated successfully"
      });

      // Navigate back to detail view
      handleBack();
    } catch (error) {
      console.error('Error updating issue report:', error);
      toast({
        title: "Error",
        description: "Failed to update issue report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <Button onClick={() => onNavigate('projects')}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 pt-[var(--header-height,60px)]">
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={() => 'bg-blue-100 text-blue-800'}
        getStatusText={() => 'Active'}
        activeSection="qaqc"
      />

      <div className="flex-1 ml-48 p-6">
        <div className="w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Report
              </Button>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h1 className="text-2xl font-bold text-foreground">Edit Issue Report</h1>
              </div>
            </div>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {/* Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Report Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Report Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter report title"
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter report description (optional)"
                  rows={4}
                />
              </div>

              {/* Attachments Section */}
              <div className="space-y-2">
                <Label>Attachments</Label>
                
                {/* Upload Area */}
                <div
                  ref={dropZoneRef}
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                    isDragOver 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag & drop files here or click to browse
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="w-4 h-4 mr-2" />
                    Browse Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Supports images, documents, and other files up to 10MB
                  </p>
                </div>

                {/* Selected Files to Upload */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Files to Upload:</h4>
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={uploadAttachments}
                      disabled={isUploading}
                      className="w-full"
                    >
                      {isUploading ? 'Uploading...' : `Upload ${attachments.length} file(s)`}
                    </Button>
                  </div>
                )}

                {/* Existing Attachments */}
                {existingAttachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Attachments ({existingAttachments.length}):</h4>
                    {existingAttachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <div className="flex items-center space-x-3">
                          {/* File Preview */}
                          {attachment.type?.startsWith('image/') ? (
                            <img 
                              src={attachment.url} 
                              alt={attachment.name}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
                              <FileText className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium">{attachment.name}</div>
                            <div className="text-xs text-gray-500">
                              {attachment.size ? formatFileSize(attachment.size) : 'Unknown size'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(attachment.url, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteExistingAttachment(attachment)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};