
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export const FinancialRatiosSection = () => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <span>Key Financial Ratios</span>
        </CardTitle>
        <CardDescription>Business health indicators</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">2.4</div>
            <div className="text-sm text-gray-600">Current Ratio</div>
            <div className="text-xs text-green-600">Healthy</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">1.8</div>
            <div className="text-sm text-gray-600">Quick Ratio</div>
            <div className="text-xs text-green-600">Strong</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">0.3</div>
            <div className="text-sm text-gray-600">Debt-to-Equity</div>
            <div className="text-xs text-green-600">Conservative</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">12.5%</div>
            <div className="text-sm text-gray-600">Operating Margin</div>
            <div className="text-xs text-yellow-600">Improving</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
