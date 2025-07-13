import { useState, useRef } from 'react';
import { toast } from 'sonner';

export interface DrawingFile {
  id: string;
  name: string;
  file: File;
  url: string;
  pages: number;
  uploadedAt: Date;
}

export const useMultiplePDFUpload = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [drawings, setDrawings] = useState<DrawingFile[]>([]);
  const [activeDrawingId, setActiveDrawingId] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newDrawings: DrawingFile[] = [];

    Array.from(files).forEach((file) => {
      if (file.type === 'application/pdf') {
        const id = `drawing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const url = URL.createObjectURL(file);
        
        // For now, we'll set pages to 1 as a default
        // In a real implementation, you'd use a PDF library to get the actual page count
        const pages = 1;

        const drawing: DrawingFile = {
          id,
          name: file.name,
          file,
          url,
          pages,
          uploadedAt: new Date()
        };

        newDrawings.push(drawing);
      } else {
        toast.error(`${file.name} is not a PDF file`);
      }
    });

    if (newDrawings.length > 0) {
      setDrawings(prev => [...prev, ...newDrawings]);
      
      // Set the first uploaded drawing as active if none is currently active
      if (!activeDrawingId && newDrawings.length > 0) {
        setActiveDrawingId(newDrawings[0].id);
      }

      toast.success(`${newDrawings.length} PDF${newDrawings.length > 1 ? 's' : ''} uploaded successfully`);
    }

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
    removeDrawing,
    setActiveDrawing,
    clearAllDrawings
  };
};