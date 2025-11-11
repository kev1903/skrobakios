import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload, MousePointer, Hand, Ruler, ZoomIn, ZoomOut, Maximize, ArrowLeft, MessageSquare, Trash2, Share2 } from "lucide-react";
import { useScreenSize } from "@/hooks/use-mobile";

interface ViewerToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onUpload: () => void;
  onMeasure: () => void;
  onClearMeasurements: () => void;
  activeMode: "select" | "measure" | "pan" | "comment";
  onModeChange: (mode: "select" | "measure" | "pan" | "comment") => void;
  onBack?: () => void;
  onShare?: () => void;
}

export const ViewerToolbar = ({
  onZoomIn,
  onZoomOut,
  onFitView,
  onUpload,
  onMeasure,
  onClearMeasurements,
  activeMode,
  onModeChange,
  onBack,
  onShare,
}: ViewerToolbarProps) => {
  const screenSize = useScreenSize();
  const isMobile = screenSize === 'mobile' || screenSize === 'mobile-small';
  const isTablet = screenSize === 'tablet';
  
  const buttonSize = isMobile ? 'h-11 w-11' : isTablet ? 'h-10 w-10' : 'h-8 w-8';
  const iconSize = isMobile ? 'h-5 w-5' : isTablet ? 'h-4.5 w-4.5' : 'h-4 w-4';
  
  return (
    <TooltipProvider>
      <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'} flex-wrap ${isMobile ? 'justify-center' : ''}`}>
        {/* Back Button - Floating */}
        {onBack && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className={`bg-white/80 backdrop-blur-xl border border-border/30 hover:bg-white/90 hover:scale-[1.02] shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-all duration-300 ${buttonSize} rounded-full`}
              >
                <ArrowLeft className={iconSize} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back to Project</TooltipContent>
          </Tooltip>
        )}
        
        {/* Mode Selection - Floating */}
        <div className={`flex items-center gap-1 ${isMobile ? 'p-1.5' : 'p-1'} bg-white/80 backdrop-blur-xl border border-border/30 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-all duration-300`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onModeChange("select")}
                className={`${buttonSize} rounded-full ${
                  activeMode === "select"
                    ? "bg-luxury-gold text-white hover:bg-luxury-gold/90 shadow-md"
                    : "hover:bg-accent/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <MousePointer className={iconSize} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Select objects</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onModeChange("pan")}
                className={`${buttonSize} rounded-full ${
                  activeMode === "pan"
                    ? "bg-luxury-gold text-white hover:bg-luxury-gold/90 shadow-md"
                    : "hover:bg-accent/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Hand className={iconSize} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Pan view</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  onModeChange("measure");
                  onMeasure();
                }}
                className={`${buttonSize} rounded-full ${
                  activeMode === "measure"
                    ? "bg-luxury-gold text-white hover:bg-luxury-gold/90 shadow-md"
                    : "hover:bg-accent/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Ruler className={iconSize} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Measure distance</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onModeChange("comment")}
                className={`${buttonSize} rounded-full ${
                  activeMode === "comment"
                    ? "bg-luxury-gold text-white hover:bg-luxury-gold/90 shadow-md"
                    : "hover:bg-accent/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageSquare className={iconSize} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {activeMode === "comment" 
                ? "Click on model to add comment" 
                : "Add comment"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Zoom Controls - Floating */}
        <div className={`flex items-center gap-1 ${isMobile ? 'p-1.5' : 'p-1'} bg-white/80 backdrop-blur-xl border border-border/30 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-all duration-300`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onZoomIn} 
                className={`hover:bg-accent/30 ${buttonSize} rounded-full text-muted-foreground hover:text-foreground transition-all duration-200`}
              >
                <ZoomIn className={iconSize} />
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
                className={`hover:bg-accent/30 ${buttonSize} rounded-full text-muted-foreground hover:text-foreground transition-all duration-200`}
              >
                <ZoomOut className={iconSize} />
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
                className={`hover:bg-accent/30 ${buttonSize} rounded-full text-muted-foreground hover:text-foreground transition-all duration-200`}
              >
                <Maximize className={iconSize} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Fit View</TooltipContent>
          </Tooltip>
        </div>

        {/* Clear Measurements Button - Floating */}
        {activeMode === "measure" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClearMeasurements}
                className={`bg-white/80 backdrop-blur-xl border border-border/30 hover:bg-white/90 hover:scale-[1.02] shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-all duration-300 ${buttonSize} rounded-full text-muted-foreground hover:text-foreground`}
              >
                <Trash2 className={iconSize} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear All Measurements</TooltipContent>
          </Tooltip>
        )}

        {/* Share Button - Floating */}
        {onShare && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onShare}
                className={`${isMobile ? '' : 'ml-auto'} bg-white/80 backdrop-blur-xl border border-border/30 hover:bg-white/90 hover:scale-[1.02] shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-all duration-300 ${buttonSize} rounded-full text-muted-foreground hover:text-foreground`}
              >
                <Share2 className={iconSize} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share Project</TooltipContent>
          </Tooltip>
        )}

        {/* Upload Button - Floating */}
        {onUpload && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onUpload}
                className={`bg-white/80 backdrop-blur-xl border border-border/30 hover:bg-white/90 hover:scale-[1.02] shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-all duration-300 ${buttonSize} rounded-full text-muted-foreground hover:text-foreground`}
              >
                <Upload className={iconSize} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Upload IFC File</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
