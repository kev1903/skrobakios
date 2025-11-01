
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export const FinancialRatiosSection = () => {
  return (
    <Card className="border border-border/30 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
      <CardHeader className="p-6">
        <CardTitle className="flex items-center space-x-2 text-lg font-bold">
          <BarChart3 className="w-5 h-5 text-luxury-gold" />
          <span>Key Financial Ratios</span>
        </CardTitle>
        <CardDescription className="text-sm">Business health indicators</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-luxury-gold/10 rounded-xl">
            <div className="text-3xl font-bold text-luxury-gold">2.4</div>
            <div className="text-sm text-foreground font-medium mt-1">Current Ratio</div>
            <div className="text-xs text-emerald-500 font-medium mt-1">Healthy</div>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded-xl">
            <div className="text-3xl font-bold text-emerald-500">1.8</div>
            <div className="text-sm text-foreground font-medium mt-1">Quick Ratio</div>
            <div className="text-xs text-emerald-500 font-medium mt-1">Strong</div>
          </div>
          <div className="text-center p-4 bg-violet-50 rounded-xl">
            <div className="text-3xl font-bold text-violet-500">0.3</div>
            <div className="text-sm text-foreground font-medium mt-1">Debt-to-Equity</div>
            <div className="text-xs text-emerald-500 font-medium mt-1">Conservative</div>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-xl">
            <div className="text-3xl font-bold text-amber-500">12.5%</div>
            <div className="text-sm text-foreground font-medium mt-1">Operating Margin</div>
            <div className="text-xs text-amber-500 font-medium mt-1">Improving</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
