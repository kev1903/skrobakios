import { useState, useRef } from 'react';
import { toast } from 'sonner';

export interface DrawingFile {
  id: string;
  name: string;
  file?: File | null;
  url: string;
  pages: number;
  uploadedAt: Date;
  storagePath?: string; // Supabase Storage path when persisted
  type?: string; // Auto-detected or user-selected document type
}

export const useMultiplePDFUpload = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [drawings, setDrawings] = useState<DrawingFile[]>([]);
  const [activeDrawingId, setActiveDrawingId] = useState<string | null>(null);

  const setDrawingsData = (items: DrawingFile[]) => {
    setDrawings(items || []);
    setActiveDrawingId(items?.[0]?.id ?? null);
  };

  const addFiles = (filesInput: FileList | File[]) => {
    let files: File[] = [];
    if (filesInput instanceof FileList) {
      files = Array.from(filesInput);
    } else {
      files = Array.from(filesInput as File[]);
    }

    const newDrawings: DrawingFile[] = [];

    files.forEach((file: File) => {
      if (file.type === 'application/pdf') {
        const id = `drawing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const url = URL.createObjectURL(file as Blob);
        const pages = 1; // default; replace with real count if using a PDF lib

        const drawing: DrawingFile = {
          id,
          name: file.name,
          file,
          url,
          pages,
          uploadedAt: new Date(),
          type: classifyFromName(file.name)
        };

        newDrawings.push(drawing);
      } else {
        toast.error(`${file.name} is not a PDF file`);
      }
    });

    if (newDrawings.length > 0) {
      setDrawings(prev => [...prev, ...newDrawings]);
      if (!activeDrawingId) {
        setActiveDrawingId(newDrawings[0].id);
      }
      toast.success(`${newDrawings.length} PDF${newDrawings.length > 1 ? 's' : ''} uploaded successfully`);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    addFiles(files);
    // Reset the input
    event.target.value = '';
  };

  const removeDrawing = (id: string) => {
    const drawing = drawings.find(d => d.id === id);
    if (drawing) {
      // Clean up the object URL
      URL.revokeObjectURL(drawing.url);
      
      setDrawings(prev => prev.filter(d => d.id !== id));
      
      // If the removed drawing was active, set a new active drawing
      if (activeDrawingId === id) {
        const remainingDrawings = drawings.filter(d => d.id !== id);
        setActiveDrawingId(remainingDrawings.length > 0 ? remainingDrawings[0].id : null);
      }

      toast.success('Drawing removed');
    }
  };

  const setActiveDrawing = (id: string) => {
    setActiveDrawingId(id);
  };

  const getActiveDrawing = () => {
    return drawings.find(d => d.id === activeDrawingId) || null;
  };

  const clearAllDrawings = () => {
    // Clean up all object URLs
    drawings.forEach(drawing => {
      URL.revokeObjectURL(drawing.url);
    });
    
    setDrawings([]);
    setActiveDrawingId(null);
    toast.success('All drawings cleared');
  };

  return {
    fileInputRef,
    drawings,
    activeDrawingId,
    activeDrawing: getActiveDrawing(),
    handleFileUpload,
    addFiles,
    removeDrawing,
    setActiveDrawing,
    clearAllDrawings,
    setDrawingsData,
  };
};