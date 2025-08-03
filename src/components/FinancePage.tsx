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
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* SkrobakiOS Background with Advanced Glass Morphism */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.03),transparent_50%)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)] -z-10" />
      
      {/* Header */}
      <div className="mb-8 relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="relative">
            <h1 className="text-5xl font-inter font-extralight tracking-[-0.02em] text-slate-700/90 mb-3 relative">
              Business Finance Dashboard
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 blur-xl rounded-lg -z-10" />
            </h1>
            <p className="text-lg font-inter font-light text-slate-500/80 tracking-wide">
              {formatTime(currentTime)}
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-6 md:mt-0">
            <Button 
              variant="outline" 
              className="bg-white/40 backdrop-blur-xl border-white/20 text-slate-700 hover:bg-white/60 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl font-medium tracking-wide"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/40 backdrop-blur-xl border-white/20 text-slate-700 hover:bg-white/60 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl font-medium tracking-wide"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-blue-600/90 backdrop-blur-xl text-white hover:bg-blue-700/90 border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-medium tracking-wide">
              <Activity className="w-4 h-4 mr-2" />
              Finance Center
            </Button>
          </div>
        </div>
      </div>

      {/* Financial Alerts - SkrobakiOS Style */}
      <div className="mb-8 relative">
        <div className="bg-white/30 backdrop-blur-2xl border border-red-200/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-50/50 to-orange-50/30 rounded-2xl" />
          <div className="relative">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100/80 rounded-xl backdrop-blur-sm">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-inter font-semibold text-red-800/90 tracking-wide">Financial Alerts</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-white/40 rounded-xl backdrop-blur-sm border border-white/30">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-slate-700">3 overdue invoices ($25,000)</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/40 rounded-xl backdrop-blur-sm border border-white/30">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-slate-700">Cash flow declining 15%</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/40 rounded-xl backdrop-blur-sm border border-white/30">
                <Target className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-slate-700">Collins St project 3.8% over budget</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - SkrobakiOS Style */}
      <Tabs defaultValue="income" className="mb-8">
        <div className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-2xl p-2 shadow-xl">
          <TabsList className="bg-transparent p-0 h-auto w-full grid grid-cols-6 gap-1">
            <TabsTrigger 
              value="income" 
              className="px-4 py-3 text-sm font-medium tracking-wide text-slate-600 data-[state=active]:bg-white/80 data-[state=active]:text-blue-600 data-[state=active]:shadow-lg rounded-xl backdrop-blur-sm transition-all duration-300 border-0"
            >
              Income
            </TabsTrigger>
            <TabsTrigger 
              value="expenses" 
              className="px-4 py-3 text-sm font-medium tracking-wide text-slate-600 data-[state=active]:bg-white/80 data-[state=active]:text-blue-600 data-[state=active]:shadow-lg rounded-xl backdrop-blur-sm transition-all duration-300 border-0"
            >
              Expenses
            </TabsTrigger>
            <TabsTrigger 
              value="debt" 
              className="px-4 py-3 text-sm font-medium tracking-wide text-slate-600 data-[state=active]:bg-white/80 data-[state=active]:text-blue-600 data-[state=active]:shadow-lg rounded-xl backdrop-blur-sm transition-all duration-300 border-0"
            >
              Debt Repayment
            </TabsTrigger>
            <TabsTrigger 
              value="legal" 
              className="px-4 py-3 text-sm font-medium tracking-wide text-slate-600 data-[state=active]:bg-white/80 data-[state=active]:text-blue-600 data-[state=active]:shadow-lg rounded-xl backdrop-blur-sm transition-all duration-300 border-0"
            >
              Legal Obligations
            </TabsTrigger>
            <TabsTrigger 
              value="assets" 
              className="px-4 py-3 text-sm font-medium tracking-wide text-slate-600 data-[state=active]:bg-white/80 data-[state=active]:text-blue-600 data-[state=active]:shadow-lg rounded-xl backdrop-blur-sm transition-all duration-300 border-0"
            >
              Assets & Improvements
            </TabsTrigger>
            <TabsTrigger 
              value="investments" 
              className="px-4 py-3 text-sm font-medium tracking-wide text-slate-600 data-[state=active]:bg-white/80 data-[state=active]:text-blue-600 data-[state=active]:shadow-lg rounded-xl backdrop-blur-sm transition-all duration-300 border-0"
            >
              Investments
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="income" className="mt-6">
          <div className="bg-white/30 backdrop-blur-2xl border border-white/30 rounded-2xl p-8 shadow-xl relative overflow-hidden animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-indigo-50/10 rounded-2xl" />
            <div className="relative">
              <div className="mb-6">
                <h2 className="text-2xl font-inter font-light text-slate-700/90 tracking-wide mb-2">Income Overview</h2>
                <p className="text-slate-500/80 font-light tracking-wide">Track revenue streams and monitor financial performance</p>
              </div>
              <div className="flex items-center justify-center h-32 relative">
                <div className="p-8 bg-white/40 rounded-2xl backdrop-blur-sm border border-white/40 shadow-lg">
                  <DollarSign className="w-16 h-16 text-blue-600/60" />
                </div>
              </div>
              <div className="text-center mt-6">
                <p className="text-slate-600 font-medium tracking-wide">Income tracking and analytics</p>
                <p className="text-sm text-slate-500/80 mt-1 tracking-wide">Monitor revenue streams and earnings</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="expenses">
          <div className="bg-white/30 backdrop-blur-2xl border border-white/30 rounded-2xl p-8 shadow-xl relative overflow-hidden animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/20 to-orange-50/10 rounded-2xl" />
            <div className="relative">
              <div className="mb-6">
                <h2 className="text-2xl font-inter font-light text-slate-700/90 tracking-wide">Expenses Overview</h2>
              </div>
              <div className="text-center py-8">
                <div className="p-6 bg-white/40 rounded-2xl backdrop-blur-sm border border-white/40 shadow-lg inline-block mb-4">
                  <TrendingDown className="w-12 h-12 text-red-500/80" />
                </div>
                <p className="text-slate-600 font-medium tracking-wide">Expense tracking functionality</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Statistics Cards - SkrobakiOS Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="bg-white/30 backdrop-blur-2xl border border-white/30 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:bg-white/40 transition-all duration-300 animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 to-indigo-50/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex flex-row items-center justify-between space-y-0 pb-3">
                <h3 className="text-sm font-medium text-slate-600/90 tracking-wide">{stat.title}</h3>
                <div className="p-2 bg-white/40 rounded-xl backdrop-blur-sm border border-white/40">
                  <stat.icon className="h-4 w-4 text-blue-600/80" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-inter font-light text-slate-700/90 tracking-tight">{stat.value}</div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className={`flex items-center px-2 py-1 rounded-lg ${
                    stat.trend === 'up' 
                      ? 'bg-green-100/80 text-green-700' 
                      : 'bg-red-100/80 text-red-700'
                  } backdrop-blur-sm`}>
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {stat.change}
                  </span>
                  <span className="text-slate-500/80 font-light tracking-wide">{stat.description}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Insights Row - SkrobakiOS Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {financialInsights.map((insight, index) => (
          <div key={index} className="bg-white/30 backdrop-blur-2xl border border-white/30 rounded-2xl p-6 shadow-xl relative overflow-hidden animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/20 to-blue-50/10 rounded-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600/90 tracking-wide">{insight.title}</p>
                  <p className="text-3xl font-inter font-light text-slate-700/90 tracking-tight">{insight.value}</p>
                  <p className="text-xs text-slate-500/80 font-light tracking-wide">{insight.description}</p>
                </div>
                <div className={`px-3 py-1 rounded-xl text-xs font-medium backdrop-blur-sm border ${
                  insight.trend === 'positive' 
                    ? 'bg-green-100/80 text-green-700 border-green-200/40' 
                    : insight.trend === 'negative'
                    ? 'bg-red-100/80 text-red-700 border-red-200/40'
                    : 'bg-slate-100/80 text-slate-700 border-slate-200/40'
                } tracking-wide`}>
                  {insight.period}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section - Recent Transactions - SkrobakiOS Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/30 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 to-indigo-50/5 rounded-2xl" />
          <div className="relative p-6">
            <div className="mb-6">
              <h3 className="text-xl font-inter font-light text-slate-700/90 tracking-wide mb-1">Recent Transactions</h3>
              <p className="text-slate-500/80 font-light tracking-wide">Latest financial activities</p>
            </div>
            <div className="space-y-3">
              {recentTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/40 backdrop-blur-sm border border-white/40 hover:bg-white/50 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-xl backdrop-blur-sm border ${
                      transaction.type === 'Income' 
                        ? 'bg-green-100/80 text-green-600 border-green-200/40' 
                        : 'bg-red-100/80 text-red-600 border-red-200/40'
                    }`}>
                      <transaction.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700/90 tracking-wide">{transaction.project}</p>
                      <p className="text-sm text-slate-500/80 font-light tracking-wide">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold tracking-wide ${
                      transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount}
                    </p>
                    <p className="text-xs text-slate-500/80 capitalize font-light tracking-wide">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/30 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/10 to-blue-50/5 rounded-2xl" />
          <div className="relative p-6">
            <div className="mb-6">
              <h3 className="text-xl font-inter font-light text-slate-700/90 tracking-wide mb-1">Quick Actions</h3>
              <p className="text-slate-500/80 font-light tracking-wide">Manage your finances efficiently</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl p-4 hover:bg-white/50 transition-all duration-300 group">
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-2 bg-white/40 rounded-xl group-hover:bg-white/60 transition-all duration-300">
                    <DollarSign className="w-6 h-6 text-green-600/80" />
                  </div>
                  <span className="text-sm font-medium text-slate-700/90 tracking-wide">Add Income</span>
                </div>
              </button>
              <button className="bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl p-4 hover:bg-white/50 transition-all duration-300 group">
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-2 bg-white/40 rounded-xl group-hover:bg-white/60 transition-all duration-300">
                    <TrendingDown className="w-6 h-6 text-red-600/80" />
                  </div>
                  <span className="text-sm font-medium text-slate-700/90 tracking-wide">Record Expense</span>
                </div>
              </button>
              <button className="bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl p-4 hover:bg-white/50 transition-all duration-300 group">
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-2 bg-white/40 rounded-xl group-hover:bg-white/60 transition-all duration-300">
                    <BarChart3 className="w-6 h-6 text-blue-600/80" />
                  </div>
                  <span className="text-sm font-medium text-slate-700/90 tracking-wide">View Reports</span>
                </div>
              </button>
              <button className="bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl p-4 hover:bg-white/50 transition-all duration-300 group">
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-2 bg-white/40 rounded-xl group-hover:bg-white/60 transition-all duration-300">
                    <Calendar className="w-6 h-6 text-purple-600/80" />
                  </div>
                  <span className="text-sm font-medium text-slate-700/90 tracking-wide">Schedule Payment</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};