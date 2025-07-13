import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { TakeoffCanvas, Measurement } from './TakeoffCanvas';
import { SimplePDFViewer } from './SimplePDFViewer';

interface PDFRendererProps {
  pdfUrl: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  currentTool: 'pointer' | 'area' | 'linear' | 'count';
  onMeasurementAdd?: (measurement: Measurement) => void;
  onMeasurementUpdate?: (id: string, measurement: Partial<Measurement>) => void;
  onMeasurementDelete?: (id: string) => void;
  measurements?: Measurement[];
}

export const PDFRenderer = ({ 
  pdfUrl, 
  canvasRef, 
  currentTool,
  onMeasurementAdd = () => {},
  onMeasurementUpdate = () => {},
  onMeasurementDelete = () => {},
  measurements = []
}: PDFRendererProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Check if PDF URL is valid
  useEffect(() => {
    console.log('PDFRenderer received URL:', pdfUrl);
    if (pdfUrl) {
      setLoading(false);
      setError(null);
    } else {
      setError('No PDF URL provided');
      setLoading(false);
    }
  }, [pdfUrl]);

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'document.pdf';
      link.click();
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(3, prev + 0.25));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.25));
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-destructive mb-2">Failed to load PDF file</div>
          <div className="text-sm text-muted-foreground">{error}</div>
          <Button 
            onClick={() => {
              setError(null);
              setLoading(true);
            }}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading PDF...</div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* PDF Viewer */}
      <div ref={pdfContainerRef} className="flex-1 relative">
        <SimplePDFViewer
          pdfUrl={pdfUrl}
          className="w-full h-full"
        />

        {/* Takeoff Canvas overlay for measurements */}
        <TakeoffCanvas
          containerRef={pdfContainerRef}
          currentTool={currentTool}
          onMeasurementAdd={onMeasurementAdd}
          onMeasurementUpdate={onMeasurementUpdate}
          onMeasurementDelete={onMeasurementDelete}
          measurements={measurements}
          scale={scale}
        />
      </div>
    </div>
  );
};