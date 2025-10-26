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
        className={`
          h-10 w-10 rounded-full transition-all duration-200
          ${activeMode === "select" 
            ? "bg-luxury-gold text-white shadow-md hover:scale-[1.02]" 
            : "bg-background/60 backdrop-blur-md border border-border/30 hover:bg-accent/50"
          }
        `}
      >
        <MousePointer className="h-4 w-4" />
      </Button>
      
      <Button
        variant={activeMode === "pan" ? "default" : "ghost"}
        size="icon"
        onClick={() => onModeChange("pan")}
        className={`
          h-10 w-10 rounded-full transition-all duration-200
          ${activeMode === "pan" 
            ? "bg-luxury-gold text-white shadow-md hover:scale-[1.02]" 
            : "bg-background/60 backdrop-blur-md border border-border/30 hover:bg-accent/50"
          }
        `}
      >
        <Hand className="h-4 w-4" />
      </Button>
      
      <Button
        variant={activeMode === "measure" ? "default" : "ghost"}
        size="icon"
        onClick={onMeasure}
        className={`
          h-10 w-10 rounded-full transition-all duration-200
          ${activeMode === "measure" 
            ? "bg-luxury-gold text-white shadow-md hover:scale-[1.02]" 
            : "bg-background/60 backdrop-blur-md border border-border/30 hover:bg-accent/50"
          }
        `}
      >
        <Ruler className="h-4 w-4" />
      </Button>

      <div className="h-6 w-px bg-border/30 mx-2" />

      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomIn}
        className="h-10 w-10 rounded-full bg-background/60 backdrop-blur-md border border-border/30 hover:bg-accent/50 transition-all duration-200 hover:scale-[1.02]"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomOut}
        className="h-10 w-10 rounded-full bg-background/60 backdrop-blur-md border border-border/30 hover:bg-accent/50 transition-all duration-200 hover:scale-[1.02]"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onFitView}
        className="h-10 w-10 rounded-full bg-background/60 backdrop-blur-md border border-border/30 hover:bg-accent/50 transition-all duration-200 hover:scale-[1.02]"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>

      <div className="h-6 w-px bg-border/30 mx-2" />

      <Button
        onClick={onUpload}
        className="gap-2 bg-luxury-gold text-white shadow-md hover:scale-[1.02] transition-all duration-200 px-5 py-2.5 h-10 rounded-full font-medium"
      >
        <Upload className="h-4 w-4" />
        Upload IFC
      </Button>
    </div>
  );
};
