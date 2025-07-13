import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface ReactPDFViewerProps {
  pdfUrl: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ReactPDFViewer = ({ pdfUrl, className, style }: ReactPDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('ReactPDFViewer received URL:', pdfUrl);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully with', numPages, 'pages');
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF loading error:', error);
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  };

  const goToPreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const goToNextPage = () => {
    if (numPages && pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(3, prev + 0.2));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.2));
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
    <div className={`flex flex-col ${className}`} style={style}>
      {/* PDF Controls */}
      <div className="flex items-center justify-between p-2 border-b bg-background shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousPage} disabled={pageNumber <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-20 text-center">
            Page {pageNumber} of {numPages}
          </span>
          <Button variant="outline" size="sm" onClick={goToNextPage} disabled={!numPages || pageNumber >= numPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
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
      </div>

      {/* PDF Document */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4 max-h-full">
        <div className="flex justify-center">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div>Loading document...</div>}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              loading={<div>Loading page...</div>}
              className="shadow-lg"
            />
          </Document>
        </div>
      </div>
    </div>
  );
};