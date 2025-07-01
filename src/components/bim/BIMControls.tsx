
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Gauge
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
              variant="ghost"
              size="sm"
              onClick={onTogglePerformance}
              className="p-2"
              title="Performance Settings"
            >
              <Gauge className="w-4 h-4" />
            </Button>
          </div>

          {/* Status */}
          <div className="border-t border-white/30 pt-2">
            <Badge variant="secondary" className="text-xs">
              Ultra-Light
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
