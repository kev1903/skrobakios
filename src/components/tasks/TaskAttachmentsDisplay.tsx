import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FileText, File, FileImage, FileVideo, FileAudio, FileCode, FileArchive, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskAttachment {
  id: string;
  task_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  uploaded_by_name: string;
  uploaded_by_avatar: string;
  created_at: string;
}

interface TaskAttachmentsDisplayProps {
  taskId: string;
}

export const TaskAttachmentsDisplay = ({ taskId }: TaskAttachmentsDisplayProps) => {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear previous attachments when taskId changes
    setAttachments([]);
    setLoading(false);
    
    if (taskId) {
      loadAttachments();
    }
  }, [taskId]);

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('task_attachments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAttachments(data || []);
    } catch (error) {
      console.error('Error loading attachments:', error);
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileName: string, fileType: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconClass = "w-4 h-4 text-muted-foreground";

    // Check by file type first
    if (fileType.startsWith('image/')) {
      return <FileImage className={iconClass} />;
    }
    if (fileType.startsWith('video/')) {
      return <FileVideo className={iconClass} />;
    }
    if (fileType.startsWith('audio/')) {
      return <FileAudio className={iconClass} />;
    }

    // Check by extension
    switch (extension) {
      case 'pdf':
        return <FileText className={iconClass} />;
      case 'doc':
      case 'docx':
        return <FileText className={iconClass} />;
      case 'xls':
      case 'xlsx':
        return <FileText className={iconClass} />;
      case 'ppt':
      case 'pptx':
        return <FileText className={iconClass} />;
      case 'txt':
      case 'md':
        return <FileText className={iconClass} />;
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'html':
      case 'css':
      case 'json':
      case 'xml':
        return <FileCode className={iconClass} />;
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return <FileArchive className={iconClass} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'svg':
      case 'webp':
        return <FileImage className={iconClass} />;
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
      case 'flv':
      case 'webm':
        return <FileVideo className={iconClass} />;
      case 'mp3':
      case 'wav':
      case 'flac':
      case 'aac':
        return <FileAudio className={iconClass} />;
      default:
        return <File className={iconClass} />;
    }
  };

  const isImageFile = (fileName: string, fileType: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return fileType.startsWith('image/') || (extension && imageExtensions.includes(extension));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="mt-6 pt-4 border-t border-border">
        <div className="text-sm text-muted-foreground">Loading attachments...</div>
      </div>
    );
  }

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 pt-4 border-t border-border">
      <h3 className="text-sm font-medium text-foreground mb-3">Attachments</h3>
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {isImageFile(attachment.file_name, attachment.file_type) ? (
                <div className="w-12 h-12 rounded-md overflow-hidden border bg-muted flex-shrink-0">
                  <img
                    src={attachment.file_url}
                    alt={attachment.file_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-md border bg-muted flex items-center justify-center flex-shrink-0">
                  {getFileIcon(attachment.file_name, attachment.file_type)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {attachment.file_name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.file_size)}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(attachment.file_url, '_blank')}
              className="flex-shrink-0"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};