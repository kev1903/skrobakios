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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex-1 p-6 space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="heading-lg text-gradient-blue">Business Finance Dashboard</h1>
            <p className="body-md text-muted-foreground mt-2">
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
            <Button variant="outline" size="sm" className="glass-hover glass-light border-glass-border">
              <PieChart className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button variant="outline" size="sm" className="glass-hover glass-light border-glass-border">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              className="bg-gradient-to-r from-brand-blue to-brand-blue-light hover:from-brand-blue-dark hover:to-brand-blue text-white shadow-lg shadow-brand-blue/25 transition-all duration-300"
              onClick={() => onNavigate('finance')}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Finance Center
            </Button>
          </div>
        </div>

        {/* Financial Categories Tabs */}
        <Tabs defaultValue="income" className="w-full">
          <TabsList className="grid w-full grid-cols-6 glass backdrop-blur-lg border-glass-border">
            <TabsTrigger value="income" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white font-inter">
              Income
            </TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white font-inter">
              Expenses
            </TabsTrigger>
            <TabsTrigger value="debt" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white font-inter">
              Debt Repayment
            </TabsTrigger>
            <TabsTrigger value="legal" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white font-inter">
              Legal Obligations
            </TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white font-inter text-xs">
              Assets & Improvements
            </TabsTrigger>
            <TabsTrigger value="investments" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white font-inter">
              Investments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-6 mt-6">
            <Card className="glass-card border-glass-border">
              <CardHeader>
                <CardTitle className="heading-md text-foreground font-playfair">Income Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <DollarSign className="h-16 w-16 text-brand-blue mx-auto mb-4" />
                  <p className="body-md text-muted-foreground">Income tracking and analytics</p>
                  <p className="text-sm text-muted-foreground/80">Monitor revenue streams and earnings</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6 mt-6">
            <Card className="glass-card border-glass-border">
              <CardHeader>
                <CardTitle className="heading-md text-foreground font-playfair">Expenses Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="h-16 w-16 text-destructive mx-auto mb-4" />
                  <p className="body-md text-muted-foreground">Track and categorize expenses</p>
                  <p className="text-sm text-muted-foreground/80">Monitor spending patterns and budgets</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="debt" className="space-y-6 mt-6">
            <Card className="glass-card border-glass-border">
              <CardHeader>
                <CardTitle className="heading-md text-foreground font-playfair">Debt Repayment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Target className="h-16 w-16 text-warning mx-auto mb-4" />
                  <p className="body-md text-muted-foreground">Manage debt obligations</p>
                  <p className="text-sm text-muted-foreground/80">Track repayment schedules and progress</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legal" className="space-y-6 mt-6">
            <Card className="glass-card border-glass-border">
              <CardHeader>
                <CardTitle className="heading-md text-foreground font-playfair">Legal Obligations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="h-16 w-16 text-brand-blue-dark mx-auto mb-4" />
                  <p className="body-md text-muted-foreground">Compliance and legal requirements</p>
                  <p className="text-sm text-muted-foreground/80">Track legal payments and obligations</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6 mt-6">
            <Card className="glass-card border-glass-border">
              <CardHeader>
                <CardTitle className="heading-md text-foreground font-playfair">Assets & Business Improvements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-16 w-16 text-brand-blue mx-auto mb-4" />
                  <p className="body-md text-muted-foreground">Asset management and improvements</p>
                  <p className="text-sm text-muted-foreground/80">Track capital investments and upgrades</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investments" className="space-y-6 mt-6">
            <Card className="glass-card border-glass-border">
              <CardHeader>
                <CardTitle className="heading-md text-foreground font-playfair">Investments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 text-success mx-auto mb-4" />
                  <p className="body-md text-muted-foreground">Investment portfolio tracking</p>
                  <p className="text-sm text-muted-foreground/80">Monitor investment performance and returns</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="glass-card interactive-minimal border-glass-border group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="body-md text-muted-foreground font-inter">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg glass-light group-hover:bg-brand-blue/10 transition-colors duration-200`}>
                  <stat.icon className={`h-4 w-4 text-brand-blue`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1 font-playfair">{stat.value}</div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-inter">{stat.description}</p>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-success' : 'text-destructive'
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
            <Card key={index} className="glass border-glass-border shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="body-md text-muted-foreground font-inter">{insight.title}</p>
                    <p className="text-xs text-muted-foreground/80 mt-1 font-inter">{insight.period}</p>
                  </div>
                  <div className={`text-lg font-bold font-playfair ${
                    insight.trend === 'positive' ? 'text-success' : 
                    insight.trend === 'negative' ? 'text-destructive' : 'text-foreground'
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
            <Card className="glass-card border-glass-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="heading-md text-foreground font-playfair">Project Performance</CardTitle>
                  <Button variant="outline" size="sm" className="glass-hover glass-light border-glass-border">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Mock Chart - replace with actual chart component */}
                <div className="h-64 glass rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 via-brand-blue/10 to-brand-blue/5"></div>
                  <div className="relative z-10 text-center">
                    <TrendingUp className="h-16 w-16 text-brand-blue mx-auto mb-4" />
                    <p className="body-md text-muted-foreground font-inter">Interactive charts coming soon</p>
                    <p className="text-sm text-muted-foreground/80 font-inter">Revenue trends, project timelines, and analytics</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transactions */}
            <Card className="glass-card border-glass-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="heading-md text-foreground font-playfair">Recent Transactions</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="glass-hover glass-light border-glass-border font-inter">Registered</Button>
                    <Button variant="outline" size="sm" className="glass-hover glass-light border-glass-border font-inter">Unregistered</Button>
                    <Button variant="outline" size="sm" className="text-brand-blue font-medium glass-light border-glass-border hover:bg-brand-blue/10 font-inter">View all</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-brand-blue/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 glass-light rounded-full flex items-center justify-center text-lg">
                          {transaction.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground font-inter">{transaction.type}</span>
                            <Badge variant={transaction.status === 'Completed' ? 'default' : 'secondary'} className="text-xs font-inter">
                              {transaction.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground font-inter">{transaction.project}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold font-playfair ${transaction.amount.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                          {transaction.amount}
                        </div>
                        <p className="text-sm text-muted-foreground font-inter">{transaction.date}</p>
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
            <Card className="glass-card border-glass-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="heading-md text-foreground font-playfair">Notifications</CardTitle>
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-brand-blue/5 transition-colors">
                    <Avatar className="h-8 w-8 border-2 border-glass-border">
                      <AvatarImage src={notification.avatar || undefined} />
                      <AvatarFallback className="glass-light text-brand-blue text-xs font-inter">
                        {notification.user.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-inter">
                        <span className="font-medium text-foreground">{notification.user}</span>
                        <span className="text-muted-foreground"> {notification.action} for </span>
                        <span className="font-medium text-brand-blue">{notification.project}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-inter">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card border-glass-border">
              <CardHeader className="pb-4">
                <CardTitle className="heading-md text-foreground font-playfair">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start glass-light hover:bg-brand-blue/10 border-glass-border font-inter"
                  onClick={() => onNavigate('projects')}
                >
                  <Users className="h-4 w-4 mr-3" />
                  View All Projects
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start glass-light hover:bg-brand-blue/10 border-glass-border font-inter"
                  onClick={() => onNavigate('tasks')}
                >
                  <Calendar className="h-4 w-4 mr-3" />
                  Manage Tasks
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start glass-light hover:bg-brand-blue/10 border-glass-border font-inter"
                  onClick={() => onNavigate('finance')}
                >
                  <DollarSign className="h-4 w-4 mr-3" />
                  Financial Overview
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start glass-light hover:bg-brand-blue/10 border-glass-border font-inter"
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