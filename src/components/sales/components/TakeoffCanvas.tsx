import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas as FabricCanvas, Point, Path, Circle as FabricCircle, Rect, Line, Text as FabricText } from 'fabric';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Edit3 } from 'lucide-react';
import { toast } from 'sonner';

export interface Measurement {
  id: string;
  type: 'area' | 'linear' | 'count';
  name: string;
  value: number;
  unit: string;
  fabricObject: any;
  scale: number;
}

interface TakeoffCanvasProps {
  containerRef: React.RefObject<HTMLDivElement>;
  currentTool: 'pointer' | 'area' | 'linear' | 'count';
  onMeasurementAdd: (measurement: Measurement) => void;
  onMeasurementUpdate: (id: string, measurement: Partial<Measurement>) => void;
  onMeasurementDelete: (id: string) => void;
  measurements: Measurement[];
  scale?: number;
}

export const TakeoffCanvas = ({
  containerRef,
  currentTool,
  onMeasurementAdd,
  onMeasurementUpdate,
  onMeasurementDelete,
  measurements,
  scale = 1
}: TakeoffCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<any>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [showMeasurementDialog, setShowMeasurementDialog] = useState(false);
  const [pendingMeasurement, setPendingMeasurement] = useState<any>(null);
  const [measurementName, setMeasurementName] = useState('');
  const [pixelsPerUnit, setPixelsPerUnit] = useState(100); // Default scale: 100 pixels = 1 meter

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = new FabricCanvas(canvasRef.current, {
      width: container.clientWidth,
      height: container.clientHeight,
      selection: currentTool === 'pointer',
      isDrawingMode: false,
      backgroundColor: 'transparent'
    });

    fabricCanvasRef.current = canvas;

    // Handle canvas resize
    const resizeCanvas = () => {
      if (container) {
        canvas.setDimensions({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      canvas.dispose();
    };
  }, [containerRef]);

  // Update canvas interaction mode based on current tool
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    canvas.selection = currentTool === 'pointer';
    canvas.forEachObject(obj => {
      obj.selectable = currentTool === 'pointer';
      obj.evented = currentTool === 'pointer';
    });
    canvas.renderAll();
  }, [currentTool]);

  // Handle mouse events for drawing
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;

    const handleMouseDown = (options: any) => {
      if (currentTool === 'pointer') return;

      const pointer = canvas.getPointer(options.e);
      setIsDrawing(true);

      if (currentTool === 'count') {
        // Add a count marker immediately
        const circle = new FabricCircle({
          left: pointer.x - 10,
          top: pointer.y - 10,
          radius: 10,
          fill: 'rgba(239, 68, 68, 0.8)',
          stroke: '#dc2626',
          strokeWidth: 2,
          selectable: false,
          evented: false
        });

        const text = new FabricText('1', {
          left: pointer.x - 5,
          top: pointer.y - 8,
          fontSize: 12,
          fill: 'white',
          fontWeight: 'bold',
          selectable: false,
          evented: false
        });

        canvas.add(circle, text);
        setPendingMeasurement({ type: 'count', objects: [circle, text], value: 1 });
        setShowMeasurementDialog(true);
        setIsDrawing(false);
      } else {
        setPoints([new Point(pointer.x, pointer.y)]);
      }
    };

    const handleMouseMove = (options: any) => {
      if (!isDrawing || currentTool === 'pointer' || currentTool === 'count') return;

      const pointer = canvas.getPointer(options.e);
      setPoints(prev => [...prev, new Point(pointer.x, pointer.y)]);

      // Draw temporary path
      if (currentPath) {
        canvas.remove(currentPath);
      }

      const pathString = points.concat([new Point(pointer.x, pointer.y)])
        .reduce((path, point, index) => {
          return index === 0 ? `M ${point.x} ${point.y}` : `${path} L ${point.x} ${point.y}`;
        }, '');

      const path = new Path(pathString, {
        stroke: currentTool === 'area' ? '#3b82f6' : '#10b981',
        strokeWidth: 2,
        fill: 'transparent',
        selectable: false,
        evented: false
      });

      setCurrentPath(path);
      canvas.add(path);
      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (!isDrawing || currentTool === 'pointer' || currentTool === 'count') return;

      setIsDrawing(false);

      if (points.length > 1) {
        let value = 0;
        let unit = '';

        if (currentTool === 'area') {
          // Calculate area using shoelace formula
          const closedPoints = [...points, points[0]]; // Close the polygon
          let area = 0;
          for (let i = 0; i < closedPoints.length - 1; i++) {
            area += closedPoints[i].x * closedPoints[i + 1].y - closedPoints[i + 1].x * closedPoints[i].y;
          }
          area = Math.abs(area) / 2;
          value = area / (pixelsPerUnit * pixelsPerUnit); // Convert to square units
          unit = 'm²';

          // Close the path for area measurements
          if (currentPath) {
            canvas.remove(currentPath);
            const closedPathString = points.concat([points[0]])
              .reduce((path, point, index) => {
                return index === 0 ? `M ${point.x} ${point.y}` : `${path} L ${point.x} ${point.y}`;
              }, '') + ' Z';

            const closedPath = new Path(closedPathString, {
              stroke: '#3b82f6',
              strokeWidth: 2,
              fill: 'rgba(59, 130, 246, 0.2)',
              selectable: false,
              evented: false
            });
            setCurrentPath(closedPath);
            canvas.add(closedPath);
          }
        } else if (currentTool === 'linear') {
          // Calculate total length
          let length = 0;
          for (let i = 0; i < points.length - 1; i++) {
            const dx = points[i + 1].x - points[i].x;
            const dy = points[i + 1].y - points[i].y;
            length += Math.sqrt(dx * dx + dy * dy);
          }
          value = length / pixelsPerUnit; // Convert to units
          unit = 'm';
        }

        setPendingMeasurement({
          type: currentTool,
          objects: [currentPath],
          value: Number(value.toFixed(2))
        });
        setShowMeasurementDialog(true);
      }

      setPoints([]);
      setCurrentPath(null);
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
    };
  }, [isDrawing, currentTool, points, currentPath, pixelsPerUnit]);

  const handleSaveMeasurement = () => {
    if (!pendingMeasurement || !measurementName.trim()) {
      toast.error('Please enter a measurement name');
      return;
    }

    const measurement: Measurement = {
      id: Date.now().toString(),
      type: pendingMeasurement.type,
      name: measurementName.trim(),
      value: pendingMeasurement.value,
      unit: pendingMeasurement.type === 'area' ? 'm²' : 
            pendingMeasurement.type === 'linear' ? 'm' : 'count',
      fabricObject: pendingMeasurement.objects,
      scale: pixelsPerUnit
    };

    onMeasurementAdd(measurement);
    setShowMeasurementDialog(false);
    setMeasurementName('');
    setPendingMeasurement(null);
    toast.success('Measurement saved successfully');
  };

  const handleCancelMeasurement = () => {
    if (pendingMeasurement?.objects && fabricCanvasRef.current) {
      pendingMeasurement.objects.forEach((obj: any) => {
        fabricCanvasRef.current?.remove(obj);
      });
      fabricCanvasRef.current.renderAll();
    }
    setShowMeasurementDialog(false);
    setMeasurementName('');
    setPendingMeasurement(null);
  };

  const deleteMeasurement = (measurement: Measurement) => {
    if (fabricCanvasRef.current && measurement.fabricObject) {
      const objects = Array.isArray(measurement.fabricObject) 
        ? measurement.fabricObject 
        : [measurement.fabricObject];
      
      objects.forEach((obj: any) => {
        fabricCanvasRef.current?.remove(obj);
      });
      fabricCanvasRef.current.renderAll();
    }
    onMeasurementDelete(measurement.id);
    toast.success('Measurement deleted');
  };

  const clearAllMeasurements = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
    }
    measurements.forEach(m => onMeasurementDelete(m.id));
    toast.success('All measurements cleared');
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto z-10"
        style={{
          cursor: currentTool === 'pointer' ? 'default' : 'crosshair'
        }}
      />

      {/* Measurement Controls */}
      <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm border rounded-lg p-3 space-y-2 z-20">
        <div className="text-xs font-medium">Scale Settings</div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="scale" className="text-xs">Pixels/m:</Label>
          <Input
            id="scale"
            type="number"
            value={pixelsPerUnit}
            onChange={(e) => setPixelsPerUnit(Number(e.target.value))}
            className="w-20 h-7 text-xs"
          />
        </div>
        <Button
          onClick={clearAllMeasurements}
          variant="outline"
          size="sm"
          className="w-full text-xs h-7"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Clear All
        </Button>
      </div>

      {/* Active Measurements List */}
      {measurements.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-sm border rounded-lg p-3 max-w-xs z-20">
          <div className="text-xs font-medium mb-2">Active Measurements</div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {measurements.map((measurement) => (
              <div key={measurement.id} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{measurement.name}</div>
                  <div className="text-muted-foreground">
                    {measurement.value} {measurement.unit}
                  </div>
                </div>
                <Button
                  onClick={() => deleteMeasurement(measurement)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-2"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Measurement Dialog */}
      <Dialog open={showMeasurementDialog} onOpenChange={setShowMeasurementDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Measurement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="measurement-name">Measurement Name</Label>
              <Input
                id="measurement-name"
                value={measurementName}
                onChange={(e) => setMeasurementName(e.target.value)}
                placeholder="Enter measurement name"
              />
            </div>
            {pendingMeasurement && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium capitalize">
                  {pendingMeasurement.type} Measurement
                </div>
                <div className="text-lg font-bold">
                  {pendingMeasurement.value} {
                    pendingMeasurement.type === 'area' ? 'm²' :
                    pendingMeasurement.type === 'linear' ? 'm' : 'count'
                  }
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancelMeasurement}>
              Cancel
            </Button>
            <Button onClick={handleSaveMeasurement}>
              Save Measurement
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};