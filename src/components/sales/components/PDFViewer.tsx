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
}
export const PDFViewer = ({
  pdfUrl,
  canvasRef,
  currentTool,
  fileInputRef
}: PDFViewerProps) => {
  return <Card className="h-full">
      <CardHeader>
        
      </CardHeader>
      <CardContent className="h-full">
        {pdfUrl ? <div className="relative h-full border-2 border-dashed border-muted rounded-lg overflow-hidden">
            <PDFRenderer pdfUrl={pdfUrl} canvasRef={canvasRef} currentTool={currentTool} />
          </div> : <div className="h-full border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Upload Project Drawings</h3>
              <p className="text-muted-foreground mb-4">
                Upload PDF drawings to start taking measurements
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Choose PDF File
              </Button>
            </div>
          </div>}
      </CardContent>
    </Card>;
};