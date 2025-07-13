import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface PDFRendererProps {
  pdfUrl: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  currentTool: 'pointer' | 'area' | 'linear' | 'count';
}

export const PDFRenderer = ({ pdfUrl, canvasRef, currentTool }: PDFRendererProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-dismiss loading after a reasonable time
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [pdfUrl]);

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
    <div className="relative h-full w-full">
      {/* Temporary placeholder for PDF viewer */}
      <div className="h-full w-full flex items-center justify-center bg-muted/20 border-2 border-dashed border-muted rounded-lg">
        <div className="text-center space-y-4">
          <div className="text-lg font-medium">PDF Viewer</div>
          <div className="text-sm text-muted-foreground">URL: {pdfUrl}</div>
          <div className="text-xs text-muted-foreground">
            PDF viewer temporarily disabled to resolve React conflicts
          </div>
          
          {/* Simple controls */}
          <div className="flex items-center gap-2 justify-center">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">1 of 1</span>
            <Button variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm">100%</span>
            <Button variant="outline" size="sm">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas overlay for measurements */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-auto z-20" 
        style={{
          cursor: currentTool === 'pointer' ? 'default' : 'crosshair'
        }} 
      />
    </div>
  );
};