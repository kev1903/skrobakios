
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

export const RevenuePipelineSection = () => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-green-600" />
          <span>Revenue Pipeline</span>
        </CardTitle>
        <CardDescription>Future revenue forecast and opportunities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <div>
              <div className="font-semibold">Confirmed Revenue</div>
              <div className="text-sm text-gray-600">Next 90 days</div>
            </div>
            <div className="text-xl font-bold text-green-600">$1.2M</div>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <div>
              <div className="font-semibold">Potential Revenue</div>
              <div className="text-sm text-gray-600">In pipeline</div>
            </div>
            <div className="text-xl font-bold text-blue-600">$2.8M</div>
          </div>
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
            <div>
              <div className="font-semibold">Conversion Rate</div>
              <div className="text-sm text-gray-600">Last 6 months</div>
            </div>
            <div className="text-xl font-bold text-purple-600">65%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
