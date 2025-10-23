import React, { useState, useEffect } from 'react';
import { FileText, Download, Image as ImageIcon, File, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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

interface TaskAttachmentPreviewProps {
  taskId: string;
}

export const TaskAttachmentPreview = ({ taskId }: TaskAttachmentPreviewProps) => {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadAttachments();
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
    } finally {
      setLoading(false);
    }
  };

  const deleteAttachment = async (attachment: TaskAttachment) => {
    try {
      // Delete from storage
      const fileName = attachment.file_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('task-attachments')
          .remove([`${taskId}/${fileName}`]);
      }

      // Delete from database
      const { error } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attachment deleted successfully",
      });

      loadAttachments();
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast({
        title: "Error",
        description: "Failed to delete attachment",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImageFile = (fileType: string) => {
    return fileType.startsWith('image/');
  };

  const isPdfFile = (fileType: string) => {
    return fileType === 'application/pdf';
  };

  const getFileIcon = (fileType: string) => {
    if (isImageFile(fileType)) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    } else if (isPdfFile(fileType)) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-border/30 p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <h3 className="text-base font-semibold mb-4 text-foreground">Attachments</h3>
        <div className="text-sm text-muted-foreground">Loading attachments...</div>
      </div>
    );
  }

  if (attachments.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-border/30 p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <h3 className="text-base font-semibold mb-4 text-foreground">
          Attachments ({attachments.length})
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="group relative border border-border/30 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200"
            >
              {/* Preview Area */}
              <div 
                className="aspect-square bg-slate-50 flex items-center justify-center cursor-pointer"
                onClick={() => {
                  if (isImageFile(attachment.file_type)) {
                    setSelectedImage(attachment.file_url);
                  } else {
                    window.open(attachment.file_url, '_blank');
                  }
                }}
              >
                {isImageFile(attachment.file_type) ? (
                  <img
                    src={attachment.file_url}
                    alt={attachment.file_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4">
                    {getFileIcon(attachment.file_type)}
                    <span className="text-xs text-center text-muted-foreground mt-2 line-clamp-2">
                      {attachment.file_name}
                    </span>
                  </div>
                )}
              </div>

              {/* File Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="text-white text-xs truncate font-medium mb-1">
                  {attachment.file_name}
                </div>
                <div className="text-white/80 text-xs">
                  {formatFileSize(attachment.file_size)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 w-7 p-0 bg-white/90 hover:bg-white shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(attachment.file_url, '_blank');
                  }}
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 w-7 p-0 bg-white/90 hover:bg-white shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAttachment(attachment);
                  }}
                >
                  <X className="w-3.5 h-3.5 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
