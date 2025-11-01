
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  DollarSign, 
  TrendingUp, 
  Wallet, 
  Activity,
  Clock,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { 
  AreaChart,
  Area,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer
} from "recharts";

export const CashFlowSection = () => {
  const cashFlowData = [
    { period: "Week 1", cashIn: 45000, cashOut: 32000, netFlow: 13000 },
    { period: "Week 2", cashIn: 52000, cashOut: 38000, netFlow: 14000 },
    { period: "Week 3", cashIn: 48000, cashOut: 35000, netFlow: 13000 },
    { period: "Week 4", cashIn: 61000, cashOut: 42000, netFlow: 19000 },
  ];

  const chartConfig = {
    cashIn: { label: "Cash In", color: "#22c55e" },
    cashOut: { label: "Cash Out", color: "#ef4444" },
    netFlow: { label: "Net Flow", color: "#3b82f6" },
  };

  return (
    <div className="mb-6">
      <h2 className="text-[11px] font-semibold text-muted-foreground mb-4 px-3 uppercase tracking-wider flex items-center space-x-2">
        <Wallet className="w-4 h-4" />
        <span>Cash Flow & Liquidity</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/30 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] border-l-4 border-l-luxury-gold hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-6">
            <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Cash on Hand</CardTitle>
            <DollarSign className="h-5 w-5 text-luxury-gold" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-3xl font-bold font-playfair text-foreground mb-2">$485,000</div>
            <div className="flex items-center text-sm text-emerald-500 font-medium">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span>5.2% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/30 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] border-l-4 border-l-emerald-500 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-6">
            <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Monthly Net Flow</CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-3xl font-bold font-playfair text-foreground mb-2">$59,000</div>
            <div className="flex items-center text-sm text-emerald-500 font-medium">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span>Positive trend</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/30 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] border-l-4 border-l-violet-500 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-6">
            <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Burn Rate</CardTitle>
            <Activity className="h-5 w-5 text-violet-500" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-3xl font-bold font-playfair text-foreground mb-2">$125K/mo</div>
            <div className="flex items-center text-sm text-amber-500 font-medium">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span>8% increase</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/30 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] border-l-4 border-l-rose-500 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-6">
            <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Cash Runway</CardTitle>
            <Clock className="h-5 w-5 text-rose-500" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-3xl font-bold font-playfair text-foreground mb-2">3.9 months</div>
            <div className="flex items-center text-sm text-rose-500 font-medium">
              <ArrowDown className="h-4 w-4 mr-1" />
              <span>Critical level</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/30 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] mt-6">
        <CardHeader className="p-6">
          <CardTitle className="text-lg font-playfair">Weekly Cash Flow Analysis</CardTitle>
          <CardDescription className="text-sm">Cash inflow, outflow, and net position</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="cashIn" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                <Area type="monotone" dataKey="cashOut" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                <Line type="monotone" dataKey="netFlow" stroke="#3b82f6" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
