import React, { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Calendar, Bell, Plus, Filter, MoreHorizontal, Download, ArrowUpRight, ArrowDownRight, PieChart, BarChart3, CreditCard, Wallet, Target, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ModernDashboardProps {
  onNavigate: (page: string) => void;
  isFinancePage?: boolean;
}

// Enhanced financial dashboard stats
const dashboardStats = [
  {
    title: "Total Revenue",
    value: "$127,340",
    icon: DollarSign,
    change: "+8.2%",
    changeType: "positive" as const,
    description: "Monthly revenue growth",
    color: "emerald"
  },
  {
    title: "Active Projects",
    value: "24",
    icon: Users,
    change: "+12%",
    changeType: "positive" as const,
    description: "Currently in progress",
    color: "blue"
  },
  {
    title: "Profit Margin",
    value: "32.4%",
    icon: TrendingUp,
    change: "+2.1%",
    changeType: "positive" as const,
    description: "Improved efficiency",
    color: "purple"
  },
  {
    title: "Monthly Target",
    value: "$12,450",
    icon: Target,
    change: "+15.3%",
    changeType: "positive" as const,
    description: "85% of goal achieved",
    color: "orange"
  }
];

// Financial insights data
const financialInsights = [
  {
    title: "Cash Flow",
    amount: "+$45,230",
    trend: "positive",
    period: "This month"
  },
  {
    title: "Expenses",
    amount: "-$23,120",
    trend: "negative",
    period: "This month"
  },
  {
    title: "Outstanding",
    amount: "$8,900",
    trend: "neutral",
    period: "Pending invoices"
  }
];

const notifications = [
  {
    id: 1,
    user: "Marcus Chen",
    action: "completed task",
    project: "Villa Renovation",
    time: "2min ago",
    avatar: null
  },
  {
    id: 2,
    user: "Sarah Wilson", 
    action: "submitted proposal",
    project: "Office Complex",
    time: "1hr ago",
    avatar: null
  },
  {
    id: 3,
    user: "David Park",
    action: "updated timeline",
    project: "Residential Tower",
    time: "3hrs ago",
    avatar: null
  }
];

const recentTransactions = [
  {
    id: 1,
    type: "Payment Received",
    project: "Modern Villa Project",
    amount: "+$15,240",
    status: "Completed",
    date: "Dec 15, 2024",
    icon: "💰"
  },
  {
    id: 2,
    type: "Material Purchase",
    project: "Office Complex",
    amount: "-$8,420",
    status: "Pending",
    date: "Dec 14, 2024", 
    icon: "🏗️"
  },
  {
    id: 3,
    type: "Contractor Payment",
    project: "Residential Tower",
    amount: "-$12,800",
    status: "Completed",
    date: "Dec 13, 2024",
    icon: "👷"
  }
];

export const ModernDashboard = ({ onNavigate, isFinancePage = false }: ModernDashboardProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex-1 p-4 space-y-2">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Business Finance Dashboard</h1>
            <p className="text-slate-600 mt-1 text-base">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} • {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="glass-hover bg-white/70 border-blue-200/50 hover:bg-white/90 transition-all duration-200">
              <PieChart className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button variant="outline" size="sm" className="glass-hover bg-white/70 border-blue-200/50 hover:bg-white/90 transition-all duration-200">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-600/25 transition-all duration-200"
              onClick={() => onNavigate('finance')}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Finance Center
            </Button>
          </div>
        </div>

        {/* Financial Categories Tabs */}
        <Tabs defaultValue="income" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white/60 backdrop-blur-sm border-white/20">
            <TabsTrigger value="income" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Income
            </TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Expenses
            </TabsTrigger>
            <TabsTrigger value="debt" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Debt Repayment
            </TabsTrigger>
            <TabsTrigger value="legal" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Legal Obligations
            </TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs">
              Assets & Improvements
            </TabsTrigger>
            <TabsTrigger value="investments" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Investments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-4 mt-0">
            <Card className="bg-white/70 backdrop-blur-lg border-blue-200/30">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Income Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <DollarSign className="h-14 w-14 text-emerald-600 mx-auto mb-3" />
                  <p className="text-slate-600">Income tracking and analytics</p>
                  <p className="text-sm text-slate-500">Monitor revenue streams and earnings</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4 mt-0">
            <Card className="bg-white/70 backdrop-blur-lg border-blue-200/30">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Expenses Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <CreditCard className="h-14 w-14 text-red-500 mx-auto mb-3" />
                  <p className="text-slate-600">Track and categorize expenses</p>
                  <p className="text-sm text-slate-500">Monitor spending patterns and budgets</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="debt" className="space-y-4 mt-0">
            <Card className="bg-white/70 backdrop-blur-lg border-blue-200/30">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Debt Repayment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Target className="h-14 w-14 text-orange-600 mx-auto mb-3" />
                  <p className="text-slate-600">Manage debt obligations</p>
                  <p className="text-sm text-slate-500">Track repayment schedules and progress</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legal" className="space-y-4 mt-0">
            <Card className="bg-white/70 backdrop-blur-lg border-blue-200/30">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Legal Obligations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Activity className="h-14 w-14 text-purple-600 mx-auto mb-3" />
                  <p className="text-slate-600">Compliance and legal requirements</p>
                  <p className="text-sm text-slate-500">Track legal payments and obligations</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4 mt-0">
            <Card className="bg-white/70 backdrop-blur-lg border-blue-200/30">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Assets & Business Improvements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <TrendingUp className="h-14 w-14 text-blue-600 mx-auto mb-3" />
                  <p className="text-slate-600">Asset management and improvements</p>
                  <p className="text-sm text-slate-500">Track capital investments and upgrades</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investments" className="space-y-4 mt-0">
            <Card className="bg-white/70 backdrop-blur-lg border-blue-200/30">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Investments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <BarChart3 className="h-14 w-14 text-emerald-600 mx-auto mb-3" />
                  <p className="text-slate-600">Investment portfolio tracking</p>
                  <p className="text-sm text-slate-500">Monitor investment performance and returns</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-${stat.color}-100/70 group-hover:bg-${stat.color}-200/70 transition-colors duration-200`}>
                  <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">{stat.description}</p>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {stat.change}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Financial Insights Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {financialInsights.map((insight, index) => (
            <Card key={index} className="bg-white/40 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{insight.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{insight.period}</p>
                  </div>
                  <div className={`text-lg font-bold ${
                    insight.trend === 'positive' ? 'text-emerald-600' : 
                    insight.trend === 'negative' ? 'text-red-500' : 'text-slate-700'
                  }`}>
                    {insight.amount}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenue Chart */}
            <Card className="glass-card bg-white/70 backdrop-blur-lg border-blue-200/30">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-800">Project Performance</CardTitle>
                  <Button variant="outline" size="sm" className="glass-hover bg-white/70 border-blue-200/50 hover:bg-white/90 transition-all duration-200">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Mock Chart - replace with actual chart component */}
                <div className="h-64 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-blue-500/30 to-blue-600/20"></div>
                  <div className="relative z-10 text-center">
                    <TrendingUp className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-600">Interactive charts coming soon</p>
                    <p className="text-sm text-slate-500">Revenue trends, project timelines, and analytics</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transactions */}
            <Card className="glass-card bg-white/70 backdrop-blur-lg border-blue-200/30">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-800">Recent Transactions</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="glass-hover bg-white/70 border-blue-200/50 hover:bg-white/90 transition-all duration-200">Registered</Button>
                    <Button variant="outline" size="sm" className="glass-hover bg-white/70 border-blue-200/50 hover:bg-white/90 transition-all duration-200">Unregistered</Button>
                    <Button variant="outline" size="sm" className="text-blue-600 font-medium bg-white/70 border-blue-200/50 hover:bg-white/90 transition-all duration-200">View all</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-blue-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                          {transaction.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800">{transaction.type}</span>
                            <Badge variant={transaction.status === 'Completed' ? 'default' : 'secondary'} className="text-xs">
                              {transaction.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500">{transaction.project}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${transaction.amount.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>
                          {transaction.amount}
                        </div>
                        <p className="text-sm text-slate-500">{transaction.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card className="glass-card bg-white/70 backdrop-blur-lg border-blue-200/30">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-800">Notifications</CardTitle>
                  <Bell className="h-5 w-5 text-slate-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50/50 transition-colors">
                    <Avatar className="h-8 w-8 border-2 border-blue-200">
                      <AvatarImage src={notification.avatar || undefined} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                        {notification.user.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium text-slate-800">{notification.user}</span>
                        <span className="text-slate-600"> {notification.action} for </span>
                        <span className="font-medium text-blue-600">{notification.project}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card bg-white/70 backdrop-blur-lg border-blue-200/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-800">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-white/50 hover:bg-white/80 border-blue-200/50"
                  onClick={() => onNavigate('projects')}
                >
                  <Users className="h-4 w-4 mr-3" />
                  View All Projects
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-white/50 hover:bg-white/80 border-blue-200/50"
                  onClick={() => onNavigate('tasks')}
                >
                  <Calendar className="h-4 w-4 mr-3" />
                  Manage Tasks
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-white/50 hover:bg-white/80 border-blue-200/50"
                  onClick={() => onNavigate('finance')}
                >
                  <DollarSign className="h-4 w-4 mr-3" />
                  Financial Overview
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-white/50 hover:bg-white/80 border-blue-200/50"
                  onClick={() => onNavigate('settings')}
                >
                  <TrendingUp className="h-4 w-4 mr-3" />
                  Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};