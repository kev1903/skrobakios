import React, { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Calendar, Bell, Plus, Filter, MoreHorizontal, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ModernDashboardProps {
  onNavigate: (page: string) => void;
  isFinancePage?: boolean;
}

// Mock data - replace with real data from your backend
const dashboardStats = [
  {
    title: "Total Projects",
    value: "24",
    icon: Users,
    change: "+12%",
    changeType: "positive" as const
  },
  {
    title: "Revenue",
    value: "$127,340",
    icon: DollarSign,
    change: "+8.2%",
    changeType: "positive" as const
  },
  {
    title: "Active Tasks",
    value: "89",
    icon: TrendingUp,
    change: "-2.1%",
    changeType: "negative" as const
  },
  {
    title: "This Month",
    value: "$12,450",
    icon: Calendar,
    change: "+15.3%",
    changeType: "positive" as const
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-200/30 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
      
      <div className="relative z-10 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Welcome back, Team!</h1>
            <p className="text-slate-600 mt-1">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="glass-hover bg-white/70 border-blue-200/50">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm" className="glass-hover bg-white/70 border-blue-200/50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              onClick={() => onNavigate('create-project')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="glass-card bg-white/70 backdrop-blur-lg border-blue-200/30 hover:bg-white/80 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100/70 rounded-lg">
                      <stat.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">{stat.title}</span>
                  </div>
                  <MoreHorizontal className="h-4 w-4 text-slate-400" />
                </div>
                
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {stat.change}
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
                  <Button variant="ghost" size="sm" className="text-slate-600">
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
                    <Button variant="ghost" size="sm" className="text-slate-600">Registered</Button>
                    <Button variant="ghost" size="sm" className="text-slate-600">Unregistered</Button>
                    <Button variant="ghost" size="sm" className="text-blue-600 font-medium">View all</Button>
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
  );
};