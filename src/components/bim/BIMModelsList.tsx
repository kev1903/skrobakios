
import { Box } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const BIMModelsList = () => {
  return (
    <Card className="backdrop-blur-sm bg-white/60 border-white/20">
      <CardHeader>
        <CardTitle>Available Models</CardTitle>
        <CardDescription>
          Manage your project's BIM models
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Box className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Main Building Model</h3>
                <p className="text-sm text-slate-500">Architecture • v2.1 • 25.8 MB</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Current
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
