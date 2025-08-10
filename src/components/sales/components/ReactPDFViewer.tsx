import React, { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';

import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker from jsDelivr matching runtime pdfjs version to avoid mismatches
const runtimePdfjsVersion = (pdfjs as any).version;
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${runtimePdfjsVersion}/build/pdf.worker.min.mjs`;

interface ReactPDFViewerProps {
  fileUrl?: string; // preferred
  pdfUrl?: string;  // backward-compat
  className?: string;
  style?: React.CSSProperties;
}

export const ReactPDFViewer = ({ fileUrl, pdfUrl, className, style }: ReactPDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const sourceUrl = fileUrl || pdfUrl || '';
  console.log('ReactPDFViewer received URL:', sourceUrl);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setNumPages(null);
    setPageNumber(1);
  }, [sourceUrl]);

  // Optionally fetch as Blob to avoid CORS preview issues
  useEffect(() => {
    let revoked: string | null = null;
    const toBlob = async () => {
      if (!sourceUrl) return;
      try {
        const res = await fetch(sourceUrl, { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        revoked = url;
        setBlobUrl(url);
      } catch (e) {
        setBlobUrl(null);
        console.warn('Blob fetch failed, falling back to direct URL:', e);
      }
    };
    toBlob();
    return () => {
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [sourceUrl]);

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

  // Show minimal inline error banner but keep viewer mounted
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


  return (
    <div className={`flex flex-col h-full relative ${className || ''}`} style={style}>
      {/* PDF Controls */}
      <div className="flex items-center justify-between p-2 border-b bg-background shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousPage} disabled={pageNumber <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-20 text-center">
            Pages: {numPages ?? '-'}
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
            file={blobUrl ?? sourceUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div className="p-6 text-sm opacity-70">Loading PDF…</div>}
          >
            {numPages ? Array.from({ length: numPages }, (_, i) => (
              <Page
                key={`page_${i + 1}`}
                pageNumber={i + 1}
                scale={scale}
                renderMode="canvas"
                loading={<div>Loading page...</div>}
                className="shadow-lg my-2"
              />
            )) : null}
          </Document>
        </div>
      </div>
    </div>
  );
};