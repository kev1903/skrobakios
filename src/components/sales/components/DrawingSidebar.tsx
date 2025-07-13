import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, FileText } from 'lucide-react';

interface DrawingSidebarProps {
  onBack?: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFile: File | null;
}

export const DrawingSidebar = ({ onBack, fileInputRef, handleFileUpload, uploadedFile }: DrawingSidebarProps) => {
  return (
    <div className="w-80 flex flex-col border-r border-border bg-background">
      {/* Header with Back Button */}
      <div className="p-4 border-b border-border">
        {onBack && <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2 mb-3 w-full justify-start hover:bg-muted">
            <ArrowLeft className="w-4 h-4" />
            Back to Estimates
          </Button>}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Drawings</h3>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
        {uploadedFile && <div className="mt-2 p-2 bg-muted rounded text-sm">
            <FileText className="w-4 h-4 inline mr-2" />
            {uploadedFile.name}
          </div>}
      </div>
    </div>
  );
};