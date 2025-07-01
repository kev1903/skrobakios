
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Zap,
  ZapOff
} from "lucide-react";

interface BIMControlsProps {
  onResetView: () => void;
  onTogglePerformance: () => void;
  performanceMode: boolean;
}

export const BIMControls = ({
  onResetView,
  onTogglePerformance,
  performanceMode
}: BIMControlsProps) => {
  return (
    <Card className="absolute top-4 left-4 z-20 backdrop-blur-sm bg-white/90 border-white/60 shadow-sm">
      <CardContent className="p-3">
        <div className="flex flex-col space-y-2">
          {/* Quick Controls */}
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetView}
              className="p-2 hover:bg-white/60"
              title="Reset View"
            >
              <Home className="w-4 h-4" />
            </Button>
            <Button
              variant={performanceMode ? "default" : "ghost"}
              size="sm"
              onClick={onTogglePerformance}
              className="p-2"
              title={performanceMode ? "Quality Mode" : "Performance Mode"}
            >
              {performanceMode ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
            </Button>
          </div>

          {/* Status */}
          <div className="border-t border-white/30 pt-2">
            <Badge variant={performanceMode ? "secondary" : "default"} className="text-xs">
              {performanceMode ? "Performance" : "Quality"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
