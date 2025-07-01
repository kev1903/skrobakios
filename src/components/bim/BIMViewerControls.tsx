
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move3D, 
  Eye, 
  Settings,
  Layers,
  Ruler,
  Home,
  Maximize
} from "lucide-react";

interface BIMViewerControlsProps {
  onResetView: () => void;
  onToggleWireframe: () => void;
  onToggleGrid: () => void;
  onToggleFullscreen: () => void;
  wireframeMode: boolean;
  gridVisible: boolean;
  isFullscreen: boolean;
}

export const BIMViewerControls = ({
  onResetView,
  onToggleWireframe,
  onToggleGrid,
  onToggleFullscreen,
  wireframeMode,
  gridVisible,
  isFullscreen
}: BIMViewerControlsProps) => {
  const [selectedTool, setSelectedTool] = useState<string>("orbit");

  const tools = [
    { id: "orbit", label: "Orbit", icon: Move3D, active: selectedTool === "orbit" },
    { id: "measure", label: "Measure", icon: Ruler, active: selectedTool === "measure" },
    { id: "section", label: "Section", icon: Layers, active: selectedTool === "section" },
  ];

  return (
    <Card className="absolute top-4 left-4 z-10 backdrop-blur-sm bg-white/80 border-white/40">
      <CardContent className="p-3">
        <div className="flex flex-col space-y-3">
          {/* Navigation Tools */}
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetView}
              className="p-2"
              title="Reset View"
            >
              <Home className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFullscreen}
              className="p-2"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>

          {/* View Controls */}
          <div className="flex space-x-2">
            <Button
              variant={wireframeMode ? "default" : "ghost"}
              size="sm"
              onClick={onToggleWireframe}
              className="p-2"
              title="Toggle Wireframe"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant={gridVisible ? "default" : "ghost"}
              size="sm"
              onClick={onToggleGrid}
              className="p-2"
              title="Toggle Grid"
            >
              <Layers className="w-4 h-4" />
            </Button>
          </div>

          {/* Tools */}
          <div className="border-t border-white/20 pt-3">
            <div className="text-xs text-slate-600 mb-2 font-medium">Tools</div>
            <div className="space-y-1">
              {tools.map((tool) => (
                <Button
                  key={tool.id}
                  variant={tool.active ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedTool(tool.id)}
                  className="w-full justify-start text-xs"
                >
                  <tool.icon className="w-3 h-3 mr-2" />
                  {tool.label}
                </Button>
              ))}
            </div>
          </div>

          {/* View Info */}
          <div className="border-t border-white/20 pt-3">
            <div className="text-xs text-slate-600 mb-2 font-medium">View Info</div>
            <div className="space-y-1">
              <Badge variant="secondary" className="text-xs">
                Perspective View
              </Badge>
              <Badge variant="outline" className="text-xs">
                Level 1
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
