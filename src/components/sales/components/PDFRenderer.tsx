import React, { useState } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PDFRendererProps {
  pdfUrl: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  currentTool: 'pointer' | 'area' | 'linear' | 'count';
}

export const PDFRenderer = ({ pdfUrl, canvasRef, currentTool }: PDFRendererProps) => {
  const [error, setError] = useState<string | null>(null);
  
  // Create the default layout plugin with simple configuration
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // Handle document load error
  const handleDocumentError = (error: any) => {
    console.error('PDF document error:', error);
    setError(`Failed to load PDF: ${error.message || 'Unknown error'}`);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-destructive mb-2">Failed to load PDF file</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* PDF Viewer */}
      <div className="h-full">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfUrl}
            plugins={[defaultLayoutPluginInstance]}
          />
        </Worker>
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
  );
};
