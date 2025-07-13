import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Upload, FileText, Eye, Trash2, Ruler, Calculator } from 'lucide-react';

interface DrawingSidebarProps {
  onBack?: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFile: File | null;
}

export const DrawingSidebar = ({ onBack, fileInputRef, handleFileUpload, uploadedFile }: DrawingSidebarProps) => {
  // Mock data for drawings and take-offs
  const drawings = uploadedFile ? [
    { id: '1', name: uploadedFile.name, pages: 3, active: true }
  ] : [];

  const takeOffs = [
    { id: '1', name: 'Foundation Areas', type: 'Area', quantity: '45.5 M²', status: 'complete' },
    { id: '2', name: 'Wall Lengths', type: 'Linear', quantity: '180 m', status: 'complete' },
    { id: '3', name: 'Door Count', type: 'Count', quantity: '8 units', status: 'pending' },
  ];

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

      <ScrollArea className="flex-1">
        {/* Drawings Section */}
        <div className="p-4 border-b border-border">
          <h4 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wide">Drawings</h4>
          <div className="space-y-2">
            {drawings.length > 0 ? drawings.map(drawing => (
              <div key={drawing.id} className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50">
                <div className="flex items-center gap-2 flex-1">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{drawing.name}</p>
                    <p className="text-xs text-muted-foreground">{drawing.pages} pages</p>
                  </div>
                  {drawing.active && <Badge variant="secondary" className="text-xs">Active</Badge>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">No drawings uploaded</p>
            )}
          </div>
        </div>

        {/* Take-Offs Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Take-Offs</h4>
            <Button variant="outline" size="sm" className="h-6 text-xs">
              <Calculator className="w-3 h-3 mr-1" />
              New
            </Button>
          </div>
          <div className="space-y-2">
            {takeOffs.map(takeOff => (
              <div key={takeOff.id} className="p-2 rounded-lg border hover:bg-muted/50">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{takeOff.name}</p>
                  <Badge 
                    variant={takeOff.status === 'complete' ? 'default' : 'secondary'} 
                    className="text-xs"
                  >
                    {takeOff.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{takeOff.type}</span>
                  <span className="font-medium">{takeOff.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};