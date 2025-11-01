
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, TrendingDown, Target } from "lucide-react";

export const FinanceAlerts = () => {
  return (
    <div className="mb-6">
      <Card className="border border-border/30 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden">
        <CardHeader className="pb-4 p-6 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10">
          <CardTitle className="flex items-center space-x-2 text-foreground text-lg font-playfair">
            <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <span>Financial Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 transition-all duration-200 hover:scale-[1.02]">
              <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-sm text-foreground font-medium">3 overdue invoices ($25,000)</span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 transition-all duration-200 hover:scale-[1.02]">
              <div className="h-8 w-8 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-4 h-4 text-rose-600" />
              </div>
              <span className="text-sm text-foreground font-medium">Cash flow declining 15%</span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 transition-all duration-200 hover:scale-[1.02]">
              <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-sm text-foreground font-medium">Collins St project 3.8% over budget</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
