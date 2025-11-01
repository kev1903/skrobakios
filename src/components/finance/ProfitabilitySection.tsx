
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export const ProfitabilitySection = () => {
  return (
    <div className="mb-6">
      <h2 className="text-[11px] font-semibold text-muted-foreground mb-4 px-3 uppercase tracking-wider flex items-center space-x-2">
        <TrendingUp className="w-4 h-4" />
        <span>Profitability</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border border-border/30 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-200">
          <CardHeader className="pb-3 p-6">
            <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Revenue (YTD)</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-3xl font-bold text-foreground mb-1">$8.2M</div>
            <div className="text-sm text-emerald-500 font-medium">+18.5% vs last year</div>
          </CardContent>
        </Card>

        <Card className="border border-border/30 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-200">
          <CardHeader className="pb-3 p-6">
            <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Gross Profit</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-3xl font-bold text-foreground mb-1">$2.1M</div>
            <div className="text-sm text-muted-foreground">25.6% margin</div>
          </CardContent>
        </Card>

        <Card className="border border-border/30 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-200">
          <CardHeader className="pb-3 p-6">
            <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Net Profit</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-3xl font-bold text-foreground mb-1">$820K</div>
            <div className="text-sm text-muted-foreground">10.0% margin</div>
          </CardContent>
        </Card>

        <Card className="border border-border/30 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-200">
          <CardHeader className="pb-3 p-6">
            <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">EBITDA</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-3xl font-bold text-foreground mb-1">$1.15M</div>
            <div className="text-sm text-muted-foreground">14.0% margin</div>
          </CardContent>
        </Card>

        <Card className="border border-border/30 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-200">
          <CardHeader className="pb-3 p-6">
            <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">ROI</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-3xl font-bold text-foreground mb-1">18.2%</div>
            <div className="text-sm text-emerald-500 font-medium">Above target</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
