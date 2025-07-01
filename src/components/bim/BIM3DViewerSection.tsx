
import { Box } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SimpleBIMViewer } from "@/components/bim/SimpleBIMViewer";
import { BIMControls } from "@/components/bim/BIMControls";

interface BIM3DViewerSectionProps {
  performanceMode: boolean;
  onResetView: () => void;
  onTogglePerformance: () => void;
}

export const BIM3DViewerSection = ({
  performanceMode,
  onResetView,
  onTogglePerformance
}: BIM3DViewerSectionProps) => {
  return (
    <div className="relative">
      <Card className="backdrop-blur-sm bg-white/60 border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="w-5 h-5" />
            3D Model Viewer
            {performanceMode && (
              <Badge variant="secondary" className="ml-auto">Performance Mode</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Interactive 3D view with optimized performance
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
            <SimpleBIMViewer 
              modelId="1" 
              className="w-full h-[500px]"
              performanceMode={performanceMode}
            />
            <BIMControls
              onResetView={onResetView}
              onTogglePerformance={onTogglePerformance}
              performanceMode={performanceMode}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
