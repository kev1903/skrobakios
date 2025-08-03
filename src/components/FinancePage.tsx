import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  PieChart,
  BarChart3,
  Calendar,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Briefcase
} from "lucide-react";

interface FinancePageProps {
  onNavigate?: (page: string) => void;
}

const dashboardStats = [
  {
    title: "Total Revenue",
    value: "$127,340",
    icon: DollarSign,
    change: "+8.2%",
    description: "Monthly revenue growth",
    trend: "up" as const
  },
  {
    title: "Active Projects",
    value: "24",
    icon: Briefcase,
    change: "+12%",
    description: "Currently in progress",
    trend: "up" as const
  },
  {
    title: "Profit Margin",
    value: "32.4%",
    icon: PieChart,
    change: "+2.1%",
    description: "Improved efficiency",
    trend: "up" as const
  },
  {
    title: "Monthly Target",
    value: "$12,450",
    icon: Target,
    change: "+15.3%",
    description: "85% of goal achieved",
    trend: "up" as const
  }
];

const financialInsights = [
  {
    title: "Cash Flow",
    value: "+$45,230",
    description: "This month",
    trend: "positive",
    period: "vs last month"
  },
  {
    title: "Expenses",
    value: "-$23,120",
    description: "This month",
    trend: "negative",
    period: "within budget"
  },
  {
    title: "Outstanding",
    value: "$8,900",
    description: "Pending invoices",
    trend: "neutral",
    period: "due this week"
  }
];

const recentTransactions = [
  {
    type: "Income",
    project: "Collins St Renovation",
    amount: "+$12,500",
    status: "completed",
    date: "Today",
    icon: ArrowUpRight
  },
  {
    type: "Expense",
    project: "Materials Purchase",
    amount: "-$3,200",
    status: "pending",
    date: "Yesterday",
    icon: ArrowDownRight
  },
  {
    type: "Income",
    project: "Martin Place Design",
    amount: "+$8,750",
    status: "completed",
    date: "2 days ago",
    icon: ArrowUpRight
  }
];

export const FinancePage = ({ onNavigate }: FinancePageProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-display font-light text-gradient-blue tracking-tight mb-2">
              Business Finance Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              {formatTime(currentTime)}
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Button variant="outline" className="glass-hover">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button variant="outline" className="glass-hover">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="button-blue">
              <Activity className="w-4 h-4 mr-2" />
              Finance Center
            </Button>
          </div>
        </div>
      </div>

      {/* Financial Alerts */}
      <Card className="glass-card border-l-4 border-l-red-500 mb-6">
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

      {/* Navigation Tabs */}
      <Tabs defaultValue="income" className="mb-8">
        <TabsList className="glass-light p-1 h-auto">
          <TabsTrigger value="income" className="px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Income
          </TabsTrigger>
          <TabsTrigger value="expenses" className="px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Expenses
          </TabsTrigger>
          <TabsTrigger value="debt" className="px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Debt Repayment
          </TabsTrigger>
          <TabsTrigger value="legal" className="px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Legal Obligations
          </TabsTrigger>
          <TabsTrigger value="assets" className="px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Assets & Improvements
          </TabsTrigger>
          <TabsTrigger value="investments" className="px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Investments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="mt-6">
          <Card className="glass-card mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Income Overview</CardTitle>
              <CardDescription>Track revenue streams and monitor financial performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 text-6xl text-primary/30">
                <DollarSign className="w-16 h-16" />
              </div>
              <div className="text-center text-muted-foreground">
                <p>Income tracking and analytics</p>
                <p className="text-sm">Monitor revenue streams and earnings</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Similar structure for other tabs */}
        <TabsContent value="expenses">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Expenses Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <TrendingDown className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <p>Expense tracking functionality</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="glass-card interactive-minimal">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span className={`flex items-center ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {stat.change}
                </span>
                <span>{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {financialInsights.map((insight, index) => (
          <Card key={index} className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{insight.title}</p>
                  <p className="text-2xl font-bold">{insight.value}</p>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  insight.trend === 'positive' 
                    ? 'bg-green-100 text-green-800' 
                    : insight.trend === 'negative'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {insight.period}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Section - Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest financial activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'Income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      <transaction.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.project}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your finances efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="glass-hover h-auto p-4 flex flex-col items-center space-y-2">
                <DollarSign className="w-6 h-6" />
                <span className="text-sm">Add Income</span>
              </Button>
              <Button variant="outline" className="glass-hover h-auto p-4 flex flex-col items-center space-y-2">
                <TrendingDown className="w-6 h-6" />
                <span className="text-sm">Record Expense</span>
              </Button>
              <Button variant="outline" className="glass-hover h-auto p-4 flex flex-col items-center space-y-2">
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm">View Reports</span>
              </Button>
              <Button variant="outline" className="glass-hover h-auto p-4 flex flex-col items-center space-y-2">
                <Calendar className="w-6 h-6" />
                <span className="text-sm">Schedule Payment</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};