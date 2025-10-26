import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, Upload, Ruler, Hand, MousePointer } from "lucide-react";

interface ViewerToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onUpload: () => void;
  onMeasure: () => void;
  activeMode: "select" | "measure" | "pan";
  onModeChange: (mode: "select" | "measure" | "pan") => void;
}

export const ViewerToolbar = ({
  onZoomIn,
  onZoomOut,
  onFitView,
  onUpload,
  onMeasure,
  activeMode,
  onModeChange,
}: ViewerToolbarProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={activeMode === "select" ? "default" : "ghost"}
        size="icon"
        onClick={() => onModeChange("select")}
        className="transition-all duration-200"
      >
        <MousePointer className="h-4 w-4" />
      </Button>
      
      <Button
        variant={activeMode === "pan" ? "default" : "ghost"}
        size="icon"
        onClick={() => onModeChange("pan")}
        className="transition-all duration-200"
      >
        <Hand className="h-4 w-4" />
      </Button>
      
      <Button
        variant={activeMode === "measure" ? "default" : "ghost"}
        size="icon"
        onClick={onMeasure}
        className="transition-all duration-200"
      >
        <Ruler className="h-4 w-4" />
      </Button>

      <div className="h-6 w-px bg-border/30 mx-1" />

      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomIn}
        className="transition-all duration-200"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomOut}
        className="transition-all duration-200"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onFitView}
        className="transition-all duration-200"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>

      <div className="h-6 w-px bg-border/30 mx-1" />

      <Button
        variant="default"
        size="sm"
        onClick={onUpload}
        className="gap-2 transition-all duration-200"
      >
        <Upload className="h-4 w-4" />
        Upload IFC
      </Button>
    </div>
  );
};
