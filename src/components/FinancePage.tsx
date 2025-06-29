
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  PieChart,
  BarChart3,
  Download,
  Plus,
  Calendar,
  AlertTriangle,
  Clock,
  Target,
  Calculator,
  FileText,
  Users,
  Activity,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Area,
  AreaChart
} from "recharts";

interface FinancePageProps {
  onNavigate?: (page: string) => void;
}

export const FinancePage = ({ onNavigate }: FinancePageProps) => {
  // Sample data - in a real app, this would come from your backend
  const cashFlowData = [
    { period: "Week 1", cashIn: 45000, cashOut: 32000, netFlow: 13000 },
    { period: "Week 2", cashIn: 52000, cashOut: 38000, netFlow: 14000 },
    { period: "Week 3", cashIn: 48000, cashOut: 35000, netFlow: 13000 },
    { period: "Week 4", cashIn: 61000, cashOut: 42000, netFlow: 19000 },
  ];

  const receivablesAging = [
    { range: "0-30 days", amount: 85000, count: 12, color: "#22c55e" },
    { range: "31-60 days", amount: 45000, count: 8, color: "#f59e0b" },
    { range: "61-90 days", amount: 25000, count: 4, color: "#ef4444" },
    { range: "90+ days", amount: 15000, count: 3, color: "#dc2626" },
  ];

  const projectProfitability = [
    { project: "Gordon St, Balwyn", budget: 2450000, actual: 2380000, margin: 2.9, status: "on-track" },
    { project: "Collins St Office", budget: 1850000, actual: 1920000, margin: -3.8, status: "over-budget" },
    { project: "Richmond Warehouse", budget: 980000, actual: 945000, margin: 3.6, status: "under-budget" },
    { project: "Docklands Tower", budget: 3200000, actual: 3180000, margin: 0.6, status: "on-track" },
  ];

  const expenseCategories = [
    { category: "Materials", current: 145000, budget: 150000, variance: -3.3 },
    { category: "Labor", current: 98000, budget: 95000, variance: 3.2 },
    { category: "Equipment", current: 25000, budget: 30000, variance: -16.7 },
    { category: "Overhead", current: 42000, budget: 40000, variance: 5.0 },
    { category: "Transport", current: 18000, budget: 20000, variance: -10.0 },
  ];

  const chartConfig = {
    cashIn: { label: "Cash In", color: "#22c55e" },
    cashOut: { label: "Cash Out", color: "#ef4444" },
    netFlow: { label: "Net Flow", color: "#3b82f6" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Finance Dashboard</h1>
            <p className="text-gray-600">Comprehensive financial health monitoring and insights</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>This Month</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </Button>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Transaction</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
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

      {/* Cash Flow & Liquidity */}
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

      {/* Profitability */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <span>Profitability</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Revenue (YTD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">$8.2M</div>
              <div className="text-sm text-green-600">+18.5% vs last year</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Gross Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">$2.1M</div>
              <div className="text-sm text-gray-600">25.6% margin</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">$820K</div>
              <div className="text-sm text-gray-600">10.0% margin</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">EBITDA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">$1.15M</div>
              <div className="text-sm text-gray-600">14.0% margin</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">ROI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">18.2%</div>
              <div className="text-sm text-green-600">Above target</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Accounts Receivable & Project Costing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Accounts Receivable */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Accounts Receivable Aging</span>
            </CardTitle>
            <CardDescription>Outstanding invoices by age</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {receivablesAging.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.range}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${item.amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{item.count} invoices</div>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Outstanding</span>
              <span className="text-lg font-bold">$170,000</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">Average DSO: 42 days</div>
          </CardContent>
        </Card>

        {/* Project Profitability */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-green-600" />
              <span>Project Profitability</span>
            </CardTitle>
            <CardDescription>Budget vs actual performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Margin %</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectProfitability.map((project, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{project.project}</TableCell>
                    <TableCell>
                      <span className={`font-semibold ${project.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {project.margin > 0 ? '+' : ''}{project.margin}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={project.status === 'on-track' ? 'default' : 
                               project.status === 'under-budget' ? 'default' : 'destructive'}
                        className={project.status === 'under-budget' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {project.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Expenses & Financial Ratios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Expenses vs Budget */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              <span>Expenses vs Budget</span>
            </CardTitle>
            <CardDescription>Monthly expense tracking by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseCategories.map((expense, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{expense.category}</span>
                    <div className="text-right">
                      <div className="font-semibold">${expense.current.toLocaleString()}</div>
                      <div className={`text-xs ${expense.variance < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {expense.variance > 0 ? '+' : ''}{expense.variance}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${expense.variance < 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min((expense.current / expense.budget) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Financial Ratios */}
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
      </div>

      {/* Pipeline & Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Pipeline */}
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

        {/* Compliance & Obligations */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-red-600" />
              <span>Compliance & Obligations</span>
            </CardTitle>
            <CardDescription>Tax, payroll, and regulatory requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border-l-4 border-l-orange-500 bg-orange-50">
                <div>
                  <div className="font-semibold">GST/BAS Due</div>
                  <div className="text-sm text-gray-600">Due: Jan 28, 2024</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-orange-600">$45,200</div>
                  <div className="text-xs text-orange-600">7 days</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border-l-4 border-l-green-500 bg-green-50">
                <div>
                  <div className="font-semibold">Payroll</div>
                  <div className="text-sm text-gray-600">Monthly total</div>
                </div>
                <div className="font-bold text-green-600">$185,000</div>
              </div>
              <div className="flex justify-between items-center p-3 border-l-4 border-l-blue-500 bg-blue-50">
                <div>
                  <div className="font-semibold">Superannuation</div>
                  <div className="text-sm text-gray-600">Quarterly liability</div>
                </div>
                <div className="font-bold text-blue-600">$18,500</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
