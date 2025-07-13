import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Download } from 'lucide-react';

interface SimplePDFViewerProps {
  pdfUrl: string;
  className?: string;
  style?: React.CSSProperties;
}

export const SimplePDFViewer = ({ pdfUrl, className, style }: SimplePDFViewerProps) => {
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('SimplePDFViewer received URL:', pdfUrl);

  useEffect(() => {
    if (pdfUrl) {
      setLoading(false);
      setError(null);
    } else {
      setError('No PDF URL provided');
      setLoading(false);
    }
  }, [pdfUrl]);

  const zoomIn = () => {
    setScale(prev => Math.min(3, prev + 0.2));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.2));
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'document.pdf';
      link.click();
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 border border-gray-300 rounded">
        <div className="text-center text-gray-600">
          <div className="text-lg mb-2">⚠️</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 border border-gray-300 rounded">
        <div className="text-center text-gray-600">
          <div className="text-lg mb-2">📄</div>
          <div>Loading PDF...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`} style={style}>
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

      {/* PDF Document */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div 
          className="flex justify-center"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          <embed
            src={pdfUrl}
            type="application/pdf"
            className="w-full border border-gray-300 shadow-lg bg-white"
            style={{
              minHeight: '800px',
              height: 'auto',
            }}
            onLoad={() => {
              console.log('PDF embed loaded successfully');
              setLoading(false);
            }}
            onError={() => {
              console.error('PDF embed failed to load');
              setError('Failed to load PDF document');
            }}
          />
        </div>
      </div>
    </div>
  );
};