import React from 'react';
import { ArrowLeft, Settings, TrendingUp, TrendingDown, AlertTriangle, DollarSign, BarChart3, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FinancePageProps {
  onNavigate?: (page: string) => void;
}

const financeMetrics = [
  {
    title: "Cash on Hand",
    value: "$485,000",
    change: "+5.2% from last week",
    changeType: "positive" as const,
    borderColor: "border-l-blue-500",
    icon: DollarSign
  },
  {
    title: "Monthly Net Flow", 
    value: "$59,000",
    change: "Positive trend",
    changeType: "positive" as const,
    borderColor: "border-l-green-500",
    icon: TrendingUp
  },
  {
    title: "Burn Rate",
    value: "$125K/mo",
    change: "8% increase",
    changeType: "warning" as const,
    borderColor: "border-l-purple-500",
    icon: BarChart3
  },
  {
    title: "Cash Runway",
    value: "3.9 months",
    change: "Critical level",
    changeType: "negative" as const,
    borderColor: "border-l-orange-500",
    icon: Clock
  }
];

const alerts = [
  {
    type: "warning" as const,
    message: "3 overdue invoices ($25,000)",
    icon: AlertTriangle
  },
  {
    type: "danger" as const,
    message: "Cash flow declining 15%",
    icon: TrendingDown
  },
  {
    type: "warning" as const,
    message: "Collins St project 3.8% over budget",
    icon: AlertTriangle
  }
];

export const FinancePage = ({ onNavigate }: FinancePageProps) => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 p-6">{/* Added pt-20 for header clearance */}
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => onNavigate?.('home')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive financial health monitoring and insights</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            CASHFLOW
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            INVOICES
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            BILLS
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            RECURRING
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Financial Alerts */}
      <Card className="mb-8 border-l-4 border-l-red-500 bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Financial Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <alert.icon className={`h-5 w-5 ${
                  alert.type === 'danger' ? 'text-red-500' : 'text-orange-500'
                }`} />
                <span className="text-sm text-gray-700">{alert.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow & Liquidity */}
      <Card className="mb-8 bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Cash Flow & Liquidity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {financeMetrics.map((metric, index) => (
              <Card key={index} className={`border-l-4 ${metric.borderColor} bg-white shadow-sm hover:shadow-md transition-shadow`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600">{metric.title}</span>
                    <metric.icon className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                    <div className={`text-sm flex items-center gap-1 ${
                      metric.changeType === 'positive' ? 'text-green-600' : 
                      metric.changeType === 'negative' ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {metric.changeType === 'positive' && <TrendingUp className="h-4 w-4" />}
                      {metric.changeType === 'negative' && <TrendingDown className="h-4 w-4" />}
                      {metric.changeType === 'warning' && <AlertTriangle className="h-4 w-4" />}
                      {metric.change}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Cash Flow Analysis */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Weekly Cash Flow Analysis</CardTitle>
          <p className="text-sm text-gray-600">Cash inflow, outflow, and net position</p>
        </CardHeader>
        <CardContent>
          {/* Mock Chart Area */}
          <div className="h-80 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0">
              {/* Mock area chart visualization */}
              <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-orange-200/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-green-200/60 to-transparent"></div>
            </div>
            <div className="relative z-10 text-center">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Interactive Cash Flow Chart</p>
              <p className="text-sm text-gray-500">Detailed analytics showing cash inflow vs outflow trends</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};