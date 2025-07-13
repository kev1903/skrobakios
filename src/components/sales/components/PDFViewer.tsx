import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { PDFRenderer } from './PDFRenderer';

interface PDFViewerProps {
  pdfUrl: string | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  currentTool: 'pointer' | 'area' | 'linear' | 'count';
  fileInputRef: React.RefObject<HTMLInputElement>;
  onLoadSamplePDF?: () => void;
}

export const PDFViewer = ({ pdfUrl, canvasRef, currentTool, fileInputRef, onLoadSamplePDF }: PDFViewerProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Project Drawing Viewer</CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        {pdfUrl ? (
          <div className="relative h-full border-2 border-dashed border-muted rounded-lg overflow-hidden">
            <PDFRenderer 
              pdfUrl={pdfUrl} 
              canvasRef={canvasRef} 
              currentTool={currentTool} 
            />
          </div>
        ) : (
          <div className="h-full border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Upload Project Drawings</h3>
              <p className="text-muted-foreground mb-4">
                Upload PDF drawings to start taking measurements
              </p>
              <div className="space-y-2">
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose PDF File
                </Button>
                <div className="text-xs text-muted-foreground">
                  Or try with{' '}
                  <button 
                    className="text-primary underline hover:no-underline"
                    onClick={() => {
                      // Load the sample PDF using callback or fallback to direct load
                      if (onLoadSamplePDF) {
                        onLoadSamplePDF();
                      } else {
                        // Fallback: try to load sample PDF directly
                        console.log('Loading sample PDF from:', `${window.location.origin}/sample.pdf`);
                        // This would need parent component integration
                      }
                    }}
                  >
                    sample PDF
                  </button>
                  {' '}to test the viewer
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};