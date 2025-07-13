import React, { useState, useCallback } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import required CSS
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PDFRendererProps {
  pdfUrl: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  currentTool: 'pointer' | 'area' | 'linear' | 'count';
}

export const PDFRenderer = ({ pdfUrl, canvasRef, currentTool }: PDFRendererProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create the default layout plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // Auto-dismiss loading after a reasonable time
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [pdfUrl]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-destructive mb-2">Failed to load PDF file</div>
          <div className="text-sm text-muted-foreground">{error}</div>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
            }}
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
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
      {/* PDF Viewer Container */}
      <div className="h-full w-full overflow-hidden">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <div className="h-full">
            <Viewer
              fileUrl={pdfUrl}
              plugins={[defaultLayoutPluginInstance]}
            />
          </div>
        </Worker>
      </div>

      {/* Canvas overlay for measurements - always render but adjust cursor */}
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