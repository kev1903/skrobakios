
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, TrendingDown, Target } from "lucide-react";

export const FinanceAlerts = () => {
  return (
    <div className="mb-6">
      <Card className="border-l-4 border-l-rose-500 bg-rose-50/50 backdrop-blur-xl rounded-2xl">
        <CardHeader className="pb-4 p-6">
          <CardTitle className="flex items-center space-x-2 text-rose-800 text-lg font-playfair">
            <AlertTriangle className="w-5 h-5" />
            <span>Financial Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-foreground">3 overdue invoices ($25,000)</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <span className="text-sm text-foreground">Cash flow declining 15%</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-foreground">Collins St project 3.8% over budget</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
