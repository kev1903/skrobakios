import { ZoomIn, ZoomOut, Maximize2, Upload, Ruler, Hand, MousePointer } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <div className="flex items-center gap-3 w-full">
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`glass-button px-4 py-2 rounded-xl flex items-center gap-2 ${
                activeMode === "select" ? "bg-primary/20 border-primary/40" : ""
              }`}
              onClick={() => onModeChange("select")}
            >
              <MousePointer className="h-4 w-4" />
              <span className="text-sm font-medium">Select</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Select Mode</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`glass-button px-4 py-2 rounded-xl flex items-center gap-2 ${
                activeMode === "pan" ? "bg-primary/20 border-primary/40" : ""
              }`}
              onClick={() => onModeChange("pan")}
            >
              <Hand className="h-4 w-4" />
              <span className="text-sm font-medium">Pan</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Pan Mode</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`glass-button px-4 py-2 rounded-xl flex items-center gap-2 ${
                activeMode === "measure" ? "bg-primary/20 border-primary/40" : ""
              }`}
              onClick={onMeasure}
            >
              <Ruler className="h-4 w-4" />
              <span className="text-sm font-medium">Measure</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Measure Distance</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="h-8 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="glass-button p-2 rounded-xl hover:scale-110 transition-transform" onClick={onZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom In</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="glass-button p-2 rounded-xl hover:scale-110 transition-transform" onClick={onZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom Out</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="glass-button p-2 rounded-xl hover:scale-110 transition-transform" onClick={onFitView}>
              <Maximize2 className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Fit View</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="glass-button px-6 py-2 rounded-xl flex items-center gap-2 bg-primary/10 hover:bg-primary/20 border-primary/30 shadow-glass-glow animate-float"
            onClick={onUpload}
          >
            <Upload className="h-4 w-4" />
            <span className="text-sm font-medium">Upload IFC</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Upload IFC File</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
