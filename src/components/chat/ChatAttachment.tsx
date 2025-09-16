import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, FileType, File } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatAttachmentData {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  uploadedAt: Date;
}

interface ChatAttachmentProps {
  attachment: ChatAttachmentData;
  className?: string;
}

export const ChatAttachment: React.FC<ChatAttachmentProps> = ({ attachment, className }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string, fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    if (fileType.includes('pdf') || ext === 'pdf') {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    if (fileType.includes('image')) {
      return <FileType className="h-4 w-4 text-blue-500" />;
    }
    if (fileType.includes('document') || ['doc', 'docx'].includes(ext || '')) {
      return <FileText className="h-4 w-4 text-blue-600" />;
    }
    if (fileType.includes('spreadsheet') || ['xls', 'xlsx'].includes(ext || '')) {
      return <FileText className="h-4 w-4 text-green-600" />;
    }
    return <File className="h-4 w-4 text-muted-foreground" />;
  };

  const handlePreview = () => {
    window.open(attachment.url, '_blank');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 border border-border rounded-lg bg-background/50 hover:bg-background/80 transition-colors",
      className
    )}>
      <div className="flex-shrink-0">
        {getFileIcon(attachment.fileType, attachment.fileName)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate" title={attachment.fileName}>
          {attachment.fileName}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatFileSize(attachment.fileSize)}
        </div>
      </div>
      
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePreview}
          className="h-8 w-8 p-0"
          title="Preview"
        >
          <Eye className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="h-8 w-8 p-0"
          title="Download"
        >
          <Download className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};