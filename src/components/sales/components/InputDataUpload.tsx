import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileText, Eye, Trash2, CheckCircle2 } from 'lucide-react';
import { DrawingFile } from '../hooks/useMultiplePDFUpload';

interface InputDataUploadProps {
  title?: string;
  description?: string;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onUploadClick: () => void;
  drawings: DrawingFile[];
  activeDrawingId?: string | null;
  onSetActiveDrawing: (id: string) => void;
  onRemoveDrawing: (id: string) => void;
}

export const InputDataUpload: React.FC<InputDataUploadProps> = ({
  title = 'Upload Project Files (PDFs)',
  description = 'Upload PDF drawings to start taking measurements',
  fileInputRef,
  onUploadClick,
  drawings,
  activeDrawingId,
  onSetActiveDrawing,
  onRemoveDrawing,
}) => {
  return (
    <section aria-labelledby="input-data-upload" className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 id="input-data-upload" className="text-base font-semibold">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button size="sm" onClick={onUploadClick} className="shrink-0">
          <Upload className="w-4 h-4 mr-2" /> Choose PDF Files
        </Button>
      </header>

      {/* Upload prompt card */}
      <div
        className="rounded-xl border border-dashed border-border bg-card text-card-foreground p-8 flex flex-col items-center justify-center"
        role="button"
        onClick={onUploadClick}
      >
        <Upload className="w-8 h-8 text-muted-foreground mb-3" />
        <p className="font-medium">Upload Project Drawings</p>
        <p className="text-sm text-muted-foreground mb-4">Upload PDF drawings to start taking measurements</p>
        <Button variant="default" size="sm" onClick={onUploadClick}>
          <Upload className="w-4 h-4 mr-2" /> Choose PDF Files
        </Button>
      </div>

      {/* Files list */}
      <div className="rounded-lg border border-border">
        <ScrollArea className="max-h-64">
          <ul className="divide-y divide-border">
            {drawings.length === 0 && (
              <li className="p-4 text-sm text-muted-foreground">No PDFs uploaded yet.</li>
            )}
            {drawings.map((d) => (
              <li key={d.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.pages} page{d.pages !== 1 ? 's' : ''} • {new Date(d.uploadedAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {activeDrawingId === d.id ? (
                    <Badge variant="secondary" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Active</Badge>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => onSetActiveDrawing(d.id)} className="gap-1">
                      <Eye className="w-4 h-4" /> Set Active
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => onRemoveDrawing(d.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>
    </section>
  );
};

export default InputDataUpload;
