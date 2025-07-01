
import { Box } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UltraLightBIMViewer } from "@/components/bim/UltraLightBIMViewer";
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
            <Badge variant="secondary" className="ml-auto">Ultra-Light Mode</Badge>
          </CardTitle>
          <CardDescription>
            Lightweight 3D viewer optimized for smooth performance
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
            <UltraLightBIMViewer 
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
