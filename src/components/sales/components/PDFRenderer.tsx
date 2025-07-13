import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';

interface PDFRendererProps {
  pdfUrl: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  currentTool: 'pointer' | 'area' | 'linear' | 'count';
}

export const PDFRenderer = ({ pdfUrl, canvasRef, currentTool }: PDFRendererProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  // Check if PDF URL is valid
  useEffect(() => {
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
      {/* PDF Controls */}
      <div className="flex items-center justify-between p-2 border-b bg-background shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 relative overflow-hidden">
        <div 
          className="w-full h-full overflow-auto p-4 bg-gray-100"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <div className="flex justify-center">
            <iframe
              src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`}
              className="w-full h-full min-h-[800px] border border-gray-300 shadow-lg"
              style={{
                backgroundColor: 'white',
              }}
              onLoad={() => setLoading(false)}
              onError={() => setError('Failed to load PDF')}
              title="PDF Viewer"
            />
          </div>
        </div>

        {/* Canvas overlay for measurements */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 pointer-events-auto z-10" 
          style={{
            cursor: currentTool === 'pointer' ? 'default' : 'crosshair'
          }} 
        />
      </div>
    </div>
  );
};