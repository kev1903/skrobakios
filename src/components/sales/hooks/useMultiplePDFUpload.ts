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

// Simple filename-based classifier to auto-detect drawing type
const classifyFromName = (name: string): string | undefined => {
  const n = name.toLowerCase().replace(/[_.-]+/g, ' ');
  const has = (kw: string) => {
    if (kw.length <= 3) {
      return new RegExp(`\\b${kw}\\b`).test(n);
    }
    return n.includes(kw);
  };
  const rules: { type: string; keywords: string[] }[] = [
    { type: 'Architectural', keywords: ['arch', 'architect', 'floor plan', 'site plan', 'ga', 'general arrangement', 'elev', 'elevation', 'section', 'plan', 'bl', 'building', 'permit', 'bp'] },
    { type: 'Structural', keywords: ['struct', 'structural', 'beam', 'column', 'rebar', 'steel', 'rc', 'slab', 'foundation', 'footing'] },
    { type: 'Electrical', keywords: ['elect', 'electrical', 'lighting', 'power', 'elv', 'single line', 'cable'] },
    { type: 'Mechanical', keywords: ['mech', 'mechanical', 'hvac', 'duct', 'chiller', 'ahu'] },
    { type: 'Plumbing', keywords: ['plumb', 'plumbing', 'pipe', 'sanitary', 'water', 'drainage'] },
    { type: 'Civil', keywords: ['civil', 'road', 'grading', 'earthwork', 'stormwater'] },
    { type: 'Landscape', keywords: ['landscape', 'planting', 'hardscape'] },
    { type: 'Interior', keywords: ['interior', 'internal', 'internals', 'fitout', 'fit-out', 'finishes', 'finish', 'joinery', 'ffe', 'f.f.e', 'f-f-e', 'bi'] },
    { type: 'Specification', keywords: ['spec', 'specification', 'covernote', 'cover note'] },
    { type: 'Schedule', keywords: ['schedule', 'door schedule', 'window schedule'] },
  ];
  for (const r of rules) {
    if (r.keywords.some(k => has(k))) return r.type;
  }
  return undefined;
}

// Parse PDF text to improve classification (first 1-2 pages)
const classifyFromPDF = async (file: File): Promise<string | undefined> => {
  try {
    const pdfjs: any = await import('pdfjs-dist');
    // Ensure worker is available
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();

    const data = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data });
    const doc = await loadingTask.promise;

    const pagesToScan = Math.min(doc.numPages, 2);
    let text = '';
    for (let i = 1; i <= pagesToScan; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      text += ' ' + content.items.map((it: any) => (it.str ?? '')).join(' ');
    }
    const n = text.toLowerCase();
    const has = (kw: string) => (kw.length <= 3 ? new RegExp(`\\b${kw}\\b`).test(n) : n.includes(kw));
    const rules: { type: string; keywords: string[] }[] = [
      { type: 'Architectural', keywords: ['architectural', 'general arrangement', 'elevation', 'section', 'floor plan', 'site plan'] },
      { type: 'Structural', keywords: ['structural', 'reinforcement', 'rebar', 'beam', 'column', 'foundation', 'footing', 'slab'] },
      { type: 'Electrical', keywords: ['electrical', 'lighting', 'power', 'single line', 'switchboard'] },
      { type: 'Mechanical', keywords: ['mechanical', 'hvac', 'duct', 'ahu', 'chiller'] },
      { type: 'Plumbing', keywords: ['plumbing', 'sanitary', 'water', 'drainage'] },
      { type: 'Civil', keywords: ['civil', 'grading', 'road', 'earthwork', 'stormwater'] },
      { type: 'Landscape', keywords: ['landscape', 'planting', 'hardscape'] },
      { type: 'Interior', keywords: ['interior', 'finishes', 'joinery', 'fitout', 'fixture', 'furniture', 'equipment'] },
      { type: 'Specification', keywords: ['specification', 'cover note', 'covernote', 'contents'] },
      { type: 'Schedule', keywords: ['schedule', 'window schedule', 'door schedule'] },
    ];
    for (const r of rules) {
      if (r.keywords.some((k) => has(k))) return r.type;
    }
    return undefined;
  } catch (_e) {
    return undefined;
  }
};

export const useMultiplePDFUpload = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [drawings, setDrawings] = useState<DrawingFile[]>([]);
  const [activeDrawingId, setActiveDrawingId] = useState<string | null>(null);

  const setDrawingsData = (items: DrawingFile[]) => {
    const normalized = (items || []).map(it => ({
      ...it,
      type: it.type ?? classifyFromName(it.name),
    }));
    setDrawings(normalized);
    setActiveDrawingId(normalized?.[0]?.id ?? null);
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

        // Attempt content-based classification asynchronously
        classifyFromPDF(file).then((autoType) => {
          if (!autoType) return;
          setDrawings((prev) =>
            prev.map((d) =>
              d.id === id && (!d.type || d.type === undefined) ? { ...d, type: autoType } : d
            )
          );
        }).catch(() => {});

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