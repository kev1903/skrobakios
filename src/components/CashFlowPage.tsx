
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer
} from "recharts";

interface CashFlowPageProps {
  onNavigate?: (page: string) => void;
}

export const CashFlowPage = ({ onNavigate }: CashFlowPageProps) => {
  const [selectedScenario, setSelectedScenario] = useState("base");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    projects: true,
    cashIn: true,
    cashOut: true
  });

  const forecastData = [
    { month: "May 23", value: 35000 },
    { month: "Jun 23", value: 42000 },
    { month: "Jul 23", value: 38000 },
    { month: "Aug 23", value: 45000 },
    { month: "Sep 23", value: 52000 },
    { month: "Oct 23", value: 48000 },
    { month: "Nov 23", value: 55000 },
    { month: "Dec 23", value: 62000 },
    { month: "Jan 24", value: 58000 },
    { month: "Feb 24", value: 65000 },
    { month: "Mar 24", value: 72000 },
    { month: "Apr 24", value: 78000 },
  ];

  const chartConfig = {
    value: { label: "Cash Flow", color: "#3b82f6" },
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const monthHeaders = ["May 25", "Jun 25", "Jul 25", "Aug 25", "Sep 25", "Oct 25"];

  const projectData = [
    { name: "Active Projects", may: -2292, jun: 4500, jul: 54667, aug: 283672, sep: 311691, oct: -4230, nov: 0, dec: 0 },
    { name: "Proposed Projects", may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 },
    { name: "Completed Projects", may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 },
  ];

  const cashInData = [
    { name: "Construction Revenue", may: 12645, jun: 5049, jul: "33927 of 0", aug: 0, sep: 0, oct: 0 },
    { name: "Consulting Revenue", may: 426587, jun: 426587, jul: "33970 of 0", aug: 291, sep: 0, oct: 0 },
    { name: "Other Revenue", may: 426587, jun: 426587, jul: "0 of 0", aug: 0, sep: 0, oct: 0 },
    { name: "Returns & Revenue", may: 426587, jun: 426587, jul: "0 of 0", aug: 0, sep: 0, oct: 0 },
  ];

  const cashOutData = [
    { name: "ATO - ICA", may: 500, jun: 1703, jul: "868 of 501", aug: 2501, sep: 2501, oct: 2501 },
    { name: "ATO - BAS Payment", may: 0, jun: 0, jul: 250, aug: 250, sep: 250, oct: 250 },
    { name: "ATO Initial Payment Plan", may: 0, jun: 1700, jul: 400, aug: 600, sep: 600, oct: 600 },
    { name: "Tax - Wage - Kevin", may: 0, jun: 0, jul: 1650, aug: 1650, sep: 1650, oct: 1650 },
    { name: "Other Expenses", may: 363, jun: 0, jul: "632 of 632", aug: 0, sep: 0, oct: 363 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cash Flow Management</h1>
            <p className="text-gray-600">Monitor and forecast your cash flow with detailed projections</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={selectedScenario} onValueChange={setSelectedScenario}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Scenario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="base">Base</SelectItem>
                <SelectItem value="optimistic">Optimistic</SelectItem>
                <SelectItem value="pessimistic">Pessimistic</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>3D View</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-700">Balance</CardTitle>
            <CardDescription className="text-sm text-gray-500">From 6 Bank Accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">A$22,543</div>
            <div className="flex items-center text-sm text-green-600 font-medium">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+A$4,351</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-700">Forecast</CardTitle>
            <CardDescription className="text-sm text-gray-500">Falls below A$0 in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">+3 Years</div>
            <Progress value={75} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">My Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  fill="url(#colorGradient)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Cash Flow Tables */}
      <div className="space-y-6">
        {/* Projects Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('projects')}
                  className="p-0 h-auto"
                >
                  {expandedSections.projects ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
                <CardTitle className="text-lg text-gray-900">Projects</CardTitle>
              </div>
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          {expandedSections.projects && (
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-gray-700">Starting Balance</th>
                      {monthHeaders.map((month, index) => (
                        <th key={index} className="text-right py-2 font-medium text-gray-700">{month}</th>
                      ))}
                    </tr>
                  </thead>
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-gray-700"></th>
                      <th className="text-right py-2 font-medium text-gray-700">15,254</th>
                      <th className="text-right py-2 font-medium text-gray-700">6,703</th>
                      <th className="text-right py-2 font-medium text-gray-700">10</th>
                      <th className="text-right py-2 font-medium text-gray-700">95,554</th>
                      <th className="text-right py-2 font-medium text-gray-700">363,634</th>
                      <th className="text-right py-2 font-medium text-gray-700">690,573</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectData.map((project, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50/50">
                        <td className="py-2 font-medium text-gray-900">{project.name}</td>
                        <td className="text-right py-2 text-gray-700">{project.may.toLocaleString()}</td>
                        <td className="text-right py-2 text-gray-700">{project.jun.toLocaleString()}</td>
                        <td className="text-right py-2 text-gray-700">{project.jul.toLocaleString()}</td>
                        <td className="text-right py-2 text-gray-700">{project.aug.toLocaleString()}</td>
                        <td className="text-right py-2 text-gray-700">{project.sep.toLocaleString()}</td>
                        <td className="text-right py-2 text-gray-700">{project.oct.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Cash In Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('cashIn')}
                  className="p-0 h-auto"
                >
                  {expandedSections.cashIn ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
                <CardTitle className="text-lg text-gray-900">Cash In</CardTitle>
              </div>
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          {expandedSections.cashIn && (
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-gray-700"></th>
                      {monthHeaders.map((month, index) => (
                        <th key={index} className="text-right py-2 font-medium text-gray-700">{month}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cashInData.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50/50">
                        <td className="py-2 font-medium text-gray-900">{item.name}</td>
                        <td className="text-right py-2 text-gray-700">{item.may.toLocaleString()}</td>
                        <td className="text-right py-2 text-gray-700">{item.jun.toLocaleString()}</td>
                        <td className="text-right py-2 text-gray-700">{item.jul}</td>
                        <td className="text-right py-2 text-gray-700">{item.aug}</td>
                        <td className="text-right py-2 text-gray-700">{item.sep}</td>
                        <td className="text-right py-2 text-gray-700">{item.oct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Cash Out Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('cashOut')}
                  className="p-0 h-auto"
                >
                  {expandedSections.cashOut ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
                <CardTitle className="text-lg text-gray-900">Cash Out</CardTitle>
              </div>
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          {expandedSections.cashOut && (
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-gray-700"></th>
                      {monthHeaders.map((month, index) => (
                        <th key={index} className="text-right py-2 font-medium text-gray-700">{month}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cashOutData.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50/50">
                        <td className="py-2 font-medium text-gray-900">{item.name}</td>
                        <td className="text-right py-2 text-gray-700">{item.may}</td>
                        <td className="text-right py-2 text-gray-700">{item.jun}</td>
                        <td className="text-right py-2 text-gray-700">{item.jul}</td>
                        <td className="text-right py-2 text-gray-700">{item.aug}</td>
                        <td className="text-right py-2 text-gray-700">{item.sep}</td>
                        <td className="text-right py-2 text-gray-700">{item.oct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};
