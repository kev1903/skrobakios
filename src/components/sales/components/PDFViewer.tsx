import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


import { PDFRenderer } from './PDFRenderer';
import { Measurement } from './TakeoffCanvas';

interface PDFViewerProps {
  pdfUrl: string | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  currentTool: 'pointer' | 'area' | 'linear' | 'count';
  fileInputRef: React.RefObject<HTMLInputElement>;
  onMeasurementAdd?: (measurement: Measurement) => void;
  onMeasurementUpdate?: (id: string, measurement: Partial<Measurement>) => void;
  onMeasurementDelete?: (id: string) => void;
  measurements?: Measurement[];
}

export const PDFViewer = ({
  pdfUrl,
  canvasRef,
  currentTool,
  fileInputRef,
  onMeasurementAdd,
  onMeasurementUpdate,
  onMeasurementDelete,
  measurements
}: PDFViewerProps) => {
  return <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Drawing PDF Viewer</CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        {pdfUrl ? <div className="relative h-full border-2 border-dashed border-muted rounded-lg overflow-hidden">
            <PDFRenderer 
              pdfUrl={pdfUrl} 
              canvasRef={canvasRef} 
              currentTool={currentTool}
              onMeasurementAdd={onMeasurementAdd}
              onMeasurementUpdate={onMeasurementUpdate}
              onMeasurementDelete={onMeasurementDelete}
              measurements={measurements}
            />
          } : <div className="h-full" aria-hidden="true" />}
            {/* removed upload placeholder */}

          </div>}
      </CardContent>
    </Card>;
};