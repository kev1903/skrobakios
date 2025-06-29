
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, TrendingDown, Target } from "lucide-react";

export const FinanceAlerts = () => {
  return (
    <div className="mb-6">
      <Card className="border-l-4 border-l-red-500 bg-red-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span>Financial Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-sm">3 overdue invoices ($25,000)</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-sm">Cash flow declining 15%</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-yellow-600" />
              <span className="text-sm">Collins St project 3.8% over budget</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
