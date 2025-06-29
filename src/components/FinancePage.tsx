
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Calendar
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
  Cell
} from "recharts";

interface FinancePageProps {
  onNavigate?: (page: string) => void;
}

export const FinancePage = ({ onNavigate }: FinancePageProps) => {
  // Sample data - in a real app, this would come from your backend
  const revenueData = [
    { month: "Jan", revenue: 45000, expenses: 32000 },
    { month: "Feb", revenue: 52000, expenses: 38000 },
    { month: "Mar", revenue: 48000, expenses: 35000 },
    { month: "Apr", revenue: 61000, expenses: 42000 },
    { month: "May", revenue: 55000, expenses: 39000 },
    { month: "Jun", revenue: 67000, expenses: 45000 },
  ];

  const expenseBreakdown = [
    { category: "Materials", value: 35, amount: 15750 },
    { category: "Labor", value: 28, amount: 12600 },
    { category: "Equipment", value: 20, amount: 9000 },
    { category: "Overhead", value: 12, amount: 5400 },
    { category: "Other", value: 5, amount: 2250 },
  ];

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1"];

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "#22c55e",
    },
    expenses: {
      label: "Expenses",
      color: "#ef4444",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Finance Dashboard</h1>
            <p className="text-gray-600">Comprehensive overview of your business financials</p>
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

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glass-card border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">$328,000</div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">$231,000</div>
            <div className="flex items-center text-sm text-red-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+8.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">$97,000</div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+18.7% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cash Flow</CardTitle>
            <Wallet className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">$145,000</div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>Positive trend</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue vs Expenses Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Revenue vs Expenses</span>
            </CardTitle>
            <CardDescription>Monthly comparison over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="#22c55e" />
                  <Bar dataKey="expenses" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown Pie Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-green-600" />
              <span>Expense Breakdown</span>
            </CardTitle>
            <CardDescription>Distribution of expenses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-2 border rounded shadow">
                            <p className="font-medium">{data.category}</p>
                            <p className="text-sm">${data.amount.toLocaleString()}</p>
                            <p className="text-sm">{data.value}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <RechartsPieChart 
                    data={expenseBreakdown}
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80}
                    dataKey="value"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </RechartsPieChart>
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {expenseBreakdown.map((item, index) => (
                <div key={item.category} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-sm text-gray-600">{item.category}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Line Chart */}
      <Card className="glass-card mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>Revenue Trend</span>
          </CardTitle>
          <CardDescription>Monthly revenue growth over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  dot={{ fill: "#22c55e" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card hover-scale cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg">Accounts Receivable</CardTitle>
            <CardDescription>Outstanding invoices and payments due</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-2">$45,200</div>
            <p className="text-sm text-gray-600">12 pending invoices</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-scale cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg">Accounts Payable</CardTitle>
            <CardDescription>Bills and expenses to be paid</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-2">$23,800</div>
            <p className="text-sm text-gray-600">8 bills due this month</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-scale cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg">Budget vs Actual</CardTitle>
            <CardDescription>Performance against budget</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-2">+12%</div>
            <p className="text-sm text-gray-600">Above budget this month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
