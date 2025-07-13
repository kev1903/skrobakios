import React, { useEffect, useRef, useState } from 'react';

interface BlobPDFViewerProps {
  pdfUrl: string;
  className?: string;
  style?: React.CSSProperties;
}

export const BlobPDFViewer = ({ pdfUrl, className, style }: BlobPDFViewerProps) => {
  const embedRef = useRef<HTMLEmbedElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pdfUrl) {
      setError('No PDF URL provided');
      return;
    }

    // Check if it's a blob URL
    if (pdfUrl.startsWith('blob:')) {
      // For blob URLs, we need to use embed element
      setError(null);
    } else {
      setError(null);
    }
  }, [pdfUrl]);

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
    <embed
      ref={embedRef}
      src={pdfUrl}
      type="application/pdf"
      className={className}
      style={style}
      width="100%"
      height="100%"
    />
  );
};