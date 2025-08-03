import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  Briefcase,
  ChevronDown
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
  const [selectedTab, setSelectedTab] = useState('income');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

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

  const tabOptions = [
    { value: 'income', label: 'Income' },
    { value: 'expenses', label: 'Expenses' },
    { value: 'debt', label: 'Debt Repayment' },
    { value: 'legal', label: 'Legal Obligations' },
    { value: 'assets', label: 'Assets & Improvements' },
    { value: 'investments', label: 'Investments' }
  ];

  const getCurrentTabLabel = () => {
    return tabOptions.find(tab => tab.value === selectedTab)?.label || 'Income';
  };

  const handleDropdownToggle = () => {
    if (!isDropdownOpen && dropdownButtonRef.current) {
      const rect = dropdownButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 2,
        left: rect.left + window.scrollX
      });
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownButtonRef.current && !dropdownButtonRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* SkrobakiOS Background with Advanced Glass Morphism */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.03),transparent_50%)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)] -z-10" />
      
      {/* Toolbar - SkrobakiOS Style */}
      <div className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-xl p-3 shadow-xl">
        <div className="flex items-center justify-between">
          {/* Left side - Title and Dropdown */}
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-inter font-light text-slate-700/90 tracking-wide">Income Management</h2>
            
            {/* Dropdown */}
            <div className="relative">
              <button 
                ref={dropdownButtonRef}
                onClick={handleDropdownToggle}
                className="px-3 py-1.5 text-xs font-medium tracking-wide text-slate-600 bg-white/80 text-blue-600 shadow-lg rounded-lg backdrop-blur-sm transition-all duration-300 border-0 flex items-center space-x-2 border border-white/40"
              >
                <span>{getCurrentTabLabel()}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu using React Portal */}
              {isDropdownOpen && createPortal(
                <div 
                  className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl w-48" 
                  style={{ 
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    zIndex: 999999
                  }}
                >
                  {tabOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedTab(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-xs font-medium tracking-wide text-left transition-all duration-200 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                        selectedTab === option.value 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-slate-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>,
                document.body
              )}
            </div>
          </div>

          {/* Right side - Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="bg-white/40 backdrop-blur-xl border-white/20 text-slate-700 hover:bg-white/60 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl font-medium tracking-wide text-xs px-3 py-1.5">
              <BarChart3 className="w-3 h-3 mr-1.5" />
              Export
            </Button>
            <Button className="bg-green-600/90 backdrop-blur-xl text-white hover:bg-green-700/90 border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-medium tracking-wide text-xs px-3 py-1.5">
              SYNC
            </Button>
            <Button className="bg-blue-600/90 backdrop-blur-xl text-white hover:bg-blue-700/90 border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-medium tracking-wide text-xs px-3 py-1.5">
              +ADD
            </Button>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      {selectedTab === 'income' && (
        <div className="mt-6 bg-white/30 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-xl relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-indigo-50/10 rounded-2xl" />
          <div className="relative p-6">
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
      )}

      {selectedTab === 'expenses' && (
        <div className="mt-6 bg-white/30 backdrop-blur-2xl border border-white/30 rounded-2xl p-8 shadow-xl relative overflow-hidden animate-fade-in">
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
      )}

      {selectedTab === 'debt' && (
        <div className="mt-6 bg-white/30 backdrop-blur-2xl border border-white/30 rounded-2xl p-8 shadow-xl relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/20 to-orange-50/10 rounded-2xl" />
          <div className="relative">
            <div className="mb-6">
              <h2 className="text-2xl font-inter font-light text-slate-700/90 tracking-wide">Debt Repayment</h2>
            </div>
            <div className="text-center py-8">
              <div className="p-6 bg-white/40 rounded-2xl backdrop-blur-sm border border-white/40 shadow-lg inline-block mb-4">
                <Target className="w-12 h-12 text-orange-500/80" />
              </div>
              <p className="text-slate-600 font-medium tracking-wide">Debt repayment tracking</p>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'legal' && (
        <div className="mt-6 bg-white/30 backdrop-blur-2xl border border-white/30 rounded-2xl p-8 shadow-xl relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 to-blue-50/10 rounded-2xl" />
          <div className="relative">
            <div className="mb-6">
              <h2 className="text-2xl font-inter font-light text-slate-700/90 tracking-wide">Legal Obligations</h2>
            </div>
            <div className="text-center py-8">
              <div className="p-6 bg-white/40 rounded-2xl backdrop-blur-sm border border-white/40 shadow-lg inline-block mb-4">
                <CheckCircle className="w-12 h-12 text-purple-500/80" />
              </div>
              <p className="text-slate-600 font-medium tracking-wide">Legal obligations management</p>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'assets' && (
        <div className="mt-6 bg-white/30 backdrop-blur-2xl border border-white/30 rounded-2xl p-8 shadow-xl relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/20 to-blue-50/10 rounded-2xl" />
          <div className="relative">
            <div className="mb-6">
              <h2 className="text-2xl font-inter font-light text-slate-700/90 tracking-wide">Assets & Improvements</h2>
            </div>
            <div className="text-center py-8">
              <div className="p-6 bg-white/40 rounded-2xl backdrop-blur-sm border border-white/40 shadow-lg inline-block mb-4">
                <Briefcase className="w-12 h-12 text-green-500/80" />
              </div>
              <p className="text-slate-600 font-medium tracking-wide">Assets and improvements tracking</p>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'investments' && (
        <div className="mt-6 bg-white/30 backdrop-blur-2xl border border-white/30 rounded-2xl p-8 shadow-xl relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 to-purple-50/10 rounded-2xl" />
          <div className="relative">
            <div className="mb-6">
              <h2 className="text-2xl font-inter font-light text-slate-700/90 tracking-wide">Investments</h2>
            </div>
            <div className="text-center py-8">
              <div className="p-6 bg-white/40 rounded-2xl backdrop-blur-sm border border-white/40 shadow-lg inline-block mb-4">
                <TrendingUp className="w-12 h-12 text-indigo-500/80" />
              </div>
              <p className="text-slate-600 font-medium tracking-wide">Investment portfolio management</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};