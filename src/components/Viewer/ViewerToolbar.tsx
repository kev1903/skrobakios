import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload, MousePointer, Hand, Ruler, ZoomIn, ZoomOut, Maximize, ArrowLeft } from "lucide-react";

interface ViewerToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onUpload: () => void;
  onMeasure: () => void;
  activeMode: "select" | "measure" | "pan";
  onModeChange: (mode: "select" | "measure" | "pan") => void;
  onBack?: () => void;
}

export const ViewerToolbar = ({
  onZoomIn,
  onZoomOut,
  onFitView,
  onUpload,
  onMeasure,
  activeMode,
  onModeChange,
  onBack,
}: ViewerToolbarProps) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-3 flex-wrap">
        {/* Back Button - Floating */}
        {onBack && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="bg-white/80 backdrop-blur-xl border border-border/30 hover:bg-white/90 hover:scale-[1.02] shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-all duration-300 h-8 w-8 rounded-full"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back to Project</TooltipContent>
          </Tooltip>
        )}
        
        {/* Mode Selection - Floating */}
        <div className="flex items-center gap-1 p-1 bg-white/80 backdrop-blur-xl border border-border/30 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-all duration-300">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onModeChange("select")}
                className={
                  activeMode === "select"
                    ? "bg-luxury-gold text-white hover:bg-luxury-gold/90 shadow-md"
                    : "hover:bg-accent/30 text-muted-foreground"
                }
              >
                <MousePointer className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Select</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Select objects</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onModeChange("pan")}
                className={
                  activeMode === "pan"
                    ? "bg-luxury-gold text-white hover:bg-luxury-gold/90 shadow-md"
                    : "hover:bg-accent/30 text-muted-foreground"
                }
              >
                <Hand className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Pan</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Pan view</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onModeChange("measure");
                  onMeasure();
                }}
                className={
                  activeMode === "measure"
                    ? "bg-luxury-gold text-white hover:bg-luxury-gold/90 shadow-md"
                    : "hover:bg-accent/30 text-muted-foreground"
                }
              >
                <Ruler className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Measure</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Measure distance</TooltipContent>
          </Tooltip>
        </div>

        {/* Zoom Controls - Floating */}
        <div className="flex items-center gap-1 p-1 bg-white/80 backdrop-blur-xl border border-border/30 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-all duration-300">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onZoomIn} 
                className="hover:bg-accent/30 h-8 w-8 rounded-full text-muted-foreground hover:text-foreground transition-all duration-200"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onZoomOut} 
                className="hover:bg-accent/30 h-8 w-8 rounded-full text-muted-foreground hover:text-foreground transition-all duration-200"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onFitView} 
                className="hover:bg-accent/30 h-8 w-8 rounded-full text-muted-foreground hover:text-foreground transition-all duration-200"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Fit View</TooltipContent>
          </Tooltip>
        </div>

        {/* Upload Button - Floating */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onUpload}
              className="ml-auto bg-white/80 backdrop-blur-xl border border-border/30 hover:bg-white/90 hover:scale-[1.02] shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-all duration-300 font-medium"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload IFC
            </Button>
          </TooltipTrigger>
          <TooltipContent>Upload IFC File</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
