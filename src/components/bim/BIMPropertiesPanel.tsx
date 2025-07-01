
import { Box } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const BIMPropertiesPanel = () => {
  return (
    <Card className="backdrop-blur-sm bg-white/60 border-white/20">
      <CardHeader>
        <CardTitle>Model Properties</CardTitle>
        <CardDescription>
          View properties of selected model elements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-slate-500">
          <Box className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p>Select an element in the 3D viewer to view its properties</p>
        </div>
      </CardContent>
    </Card>
  );
};
