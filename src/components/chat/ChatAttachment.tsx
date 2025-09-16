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
      "group flex items-center gap-4 p-4 border border-border/50 rounded-xl bg-card/30 hover:bg-card/60 transition-all duration-200 cursor-pointer hover:shadow-lg hover:border-border",
      className
    )}
    onClick={handlePreview}
    >
      <div className="flex-shrink-0 p-3 rounded-lg bg-primary/10 border border-primary/20">
        {getFileIcon(attachment.fileType, attachment.fileName)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-foreground mb-1 truncate" title={attachment.fileName}>
          {attachment.fileName}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatFileSize(attachment.fileSize)}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
          <span className="capitalize">{attachment.fileType.includes('pdf') ? 'PDF Document' : 'File'}</span>
        </div>
        <div className="text-xs text-primary/80 mt-1 group-hover:text-primary transition-colors">
          Click to preview
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handlePreview();
          }}
          className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary"
          title="Preview file"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary"
          title="Download file"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};