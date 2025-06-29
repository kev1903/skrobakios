
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
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <Wallet className="w-5 h-5 text-blue-600" />
        <span>Cash Flow & Liquidity</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cash on Hand</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">$485,000</div>
            <div className="flex items-center text-sm text-green-600">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>5.2% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Net Flow</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">$59,000</div>
            <div className="flex items-center text-sm text-green-600">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>Positive trend</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Burn Rate</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">$125K/mo</div>
            <div className="flex items-center text-sm text-orange-600">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>8% increase</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cash Runway</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">3.9 months</div>
            <div className="flex items-center text-sm text-red-600">
              <ArrowDown className="h-3 w-3 mr-1" />
              <span>Critical level</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card mt-6">
        <CardHeader>
          <CardTitle>Weekly Cash Flow Analysis</CardTitle>
          <CardDescription>Cash inflow, outflow, and net position</CardDescription>
        </CardHeader>
        <CardContent>
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
