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
      
      {/* Navigation Tabs - SkrobakiOS Style */}
      <Tabs defaultValue="income">
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
          <div className="bg-white/30 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-xl relative overflow-hidden animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-indigo-50/10 rounded-2xl" />
            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-inter font-light text-slate-700/90 tracking-wide mb-2">Income Management</h2>
                  <p className="text-slate-500/80 font-light tracking-wide">Track and categorize your business revenue</p>
                </div>
                <Button className="bg-blue-600/90 backdrop-blur-xl text-white hover:bg-blue-700/90 border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-medium tracking-wide">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Add Income
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl px-4 py-2">
                  <select className="bg-transparent text-slate-700 text-sm font-medium tracking-wide outline-none">
                    <option>All Projects</option>
                    <option>Collins St Renovation</option>
                    <option>Martin Place Design</option>
                    <option>Queen St Development</option>
                  </select>
                </div>
                <div className="bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl px-4 py-2">
                  <select className="bg-transparent text-slate-700 text-sm font-medium tracking-wide outline-none">
                    <option>All Clients</option>
                    <option>ABC Construction</option>
                    <option>Design Co Ltd</option>
                    <option>Property Group</option>
                  </select>
                </div>
                <div className="bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl px-4 py-2">
                  <select className="bg-transparent text-slate-700 text-sm font-medium tracking-wide outline-none">
                    <option>All Categories</option>
                    <option>Project Payment</option>
                    <option>Consultation</option>
                    <option>Design Services</option>
                    <option>Construction</option>
                  </select>
                </div>
              </div>

              {/* Income Table */}
              <div className="bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-4 px-6 text-sm font-medium text-slate-600/90 tracking-wide">Date</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-slate-600/90 tracking-wide">Description</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-slate-600/90 tracking-wide">Amount</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-slate-600/90 tracking-wide">Client</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-slate-600/90 tracking-wide">Project</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-slate-600/90 tracking-wide">Category</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-slate-600/90 tracking-wide">Status</th>
                        <th className="text-right py-4 px-6 text-sm font-medium text-slate-600/90 tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={8} className="py-12 text-center">
                          <div className="flex flex-col items-center space-y-3">
                            <div className="p-4 bg-white/40 rounded-2xl backdrop-blur-sm border border-white/40">
                              <DollarSign className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-600 font-medium tracking-wide">No income entries yet</p>
                            <p className="text-sm text-slate-500/80 tracking-wide">Start by adding your first income record</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Row */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/20">
                <div className="text-sm text-slate-600/80 tracking-wide">
                  Showing 0 income entries
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm text-slate-600/80 tracking-wide">Total Income</p>
                    <p className="text-2xl font-inter font-light text-slate-400 tracking-tight">$0.00</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600/80 tracking-wide">This Month</p>
                    <p className="text-lg font-medium text-slate-400 tracking-wide">$0.00</p>
                  </div>
                </div>
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
    </div>
  );
};