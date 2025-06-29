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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight,
  X
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

interface BreakdownItem {
  date: string;
  description: string;
  invoiceNumber: string;
  amount: number;
  status: string;
}

interface BreakdownData {
  title: string;
  month: string;
  items: BreakdownItem[];
  total: number;
  expected: number;
  overExpected: number;
}

export const CashFlowPage = ({ onNavigate }: CashFlowPageProps) => {
  const [selectedScenario, setSelectedScenario] = useState("base");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    projects: true,
    cashIn: true,
    cashOut: true
  });
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [selectedBreakdown, setSelectedBreakdown] = useState<BreakdownData | null>(null);

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

  // Sample breakdown data for demonstration
  const getBreakdownData = (itemName: string, month: string): BreakdownData => {
    if (itemName === "Construction Revenue" && month === "May 25") {
      return {
        title: "Construction Revenue",
        month: "May '25",
        items: [
          { date: "Paid - 01 May", description: "Ben Holst & Jacqui Junkeer", invoiceNumber: "INV-0277", amount: 3500.00, status: "Paid" },
          { date: "Paid - 12 May", description: "CourtScopes", invoiceNumber: "INV-0275", amount: 2050.06, status: "Paid" },
          { date: "Paid - 19 May", description: "Vista Plastering", invoiceNumber: "INV-0281", amount: 2090.00, status: "Paid" },
          { date: "Paid - 23 May", description: "Kings Cut Concrete Pty Ltd", invoiceNumber: "INV-0279", amount: 3025.00, status: "Paid" },
          { date: "Paid - 26 May", description: "Lyall Johaan", invoiceNumber: "INV-0283", amount: 907.50, status: "Paid" },
          { date: "Paid - 26 May", description: "Patrick & Nomsa", invoiceNumber: "INV-0285", amount: 3498.00, status: "Paid" },
          { date: "Paid - 27 May", description: "Vista Plastering", invoiceNumber: "INV-0284", amount: 2974.40, status: "Paid" },
        ],
        total: 18044.96,
        expected: 0.00,
        overExpected: 0.00
      };
    }

    // Default breakdown for other items
    return {
      title: itemName,
      month: month,
      items: [
        { date: "Paid - 15 " + month.split(' ')[0], description: "Sample Transaction 1", invoiceNumber: "INV-001", amount: 1200.00, status: "Paid" },
        { date: "Paid - 28 " + month.split(' ')[0], description: "Sample Transaction 2", invoiceNumber: "INV-002", amount: 850.00, status: "Paid" },
      ],
      total: 2050.00,
      expected: 500.00,
      overExpected: 0.00
    };
  };

  const handleCellClick = (itemName: string, month: string, value: any) => {
    // Only show breakdown for cells with actual values
    if (value !== 0 && value !== "" && value !== "0 of 0") {
      const breakdown = getBreakdownData(itemName, month);
      setSelectedBreakdown(breakdown);
      setShowBreakdown(true);
    }
  };

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
                        <td 
                          className="text-right py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => handleCellClick(project.name, monthHeaders[0], project.may)}
                        >
                          {project.may.toLocaleString()}
                        </td>
                        <td 
                          className="text-right py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => handleCellClick(project.name, monthHeaders[1], project.jun)}
                        >
                          {project.jun.toLocaleString()}
                        </td>
                        <td 
                          className="text-right py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => handleCellClick(project.name, monthHeaders[2], project.jul)}
                        >
                          {project.jul.toLocaleString()}
                        </td>
                        <td 
                          className="text-right py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => handleCellClick(project.name, monthHeaders[3], project.aug)}
                        >
                          {project.aug.toLocaleString()}
                        </td>
                        <td 
                          className="text-right py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => handleCellClick(project.name, monthHeaders[4], project.sep)}
                        >
                          {project.sep.toLocaleString()}
                        </td>
                        <td 
                          className="text-right py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => handleCellClick(project.name, monthHeaders[5], project.oct)}
                        >
                          {project.oct.toLocaleString()}
                        </td>
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
                        <td 
                          className="text-right py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => handleCellClick(item.name, monthHeaders[0], item.may)}
                        >
                          {item.may.toLocaleString()}
                        </td>
                        <td 
                          className="text-right py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => handleCellClick(item.name, monthHeaders[1], item.jun)}
                        >
                          {item.jun.toLocaleString()}
                        </td>
                        <td 
                          className="text-right py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => handleCellClick(item.name, monthHeaders[2], item.jul)}
                        >
                          {item.jul}
                        </td>
                        <td 
                          className="text-right py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => handleCellClick(item.name, monthHeaders[3], item.aug)}
                        >
                          {item.aug}
                        </td>
                        <td 
                          className="text-right py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => handleCellClick(item.name, monthHeaders[4], item.sep)}
                        >
                          {item.sep}
                        </td>
                        <td 
                          className="text-right py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => handleCellClick(item.name, monthHeaders[5], item.oct)}
                        >
                          {item.oct}
                        </td>
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
                        <td 
                          className="text-right py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => handleCellClick(item.name, monthHeaders[0], item.may)}
                        >
                          {item.may}
                        </td>
                        <td 
                          className="text-right py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => handleCellClick(item.name, monthHeaders[1], item.jun)}
                        >
                          {item.jun}
                        </td>
                        <td 
                          className="text-right py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => handleCellClick(item.name, monthHeaders[2], item.jul)}
                        >
                          {item.jul}
                        </td>
                        <td 
                          className="text-right py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => handleCellClick(item.name, monthHeaders[3], item.aug)}
                        >
                          {item.aug}
                        </td>
                        <td 
                          className="text-right py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => handleCellClick(item.name, monthHeaders[4], item.sep)}
                        >
                          {item.sep}
                        </td>
                        <td 
                          className="text-right py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => handleCellClick(item.name, monthHeaders[5], item.oct)}
                        >
                          {item.oct}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Breakdown Dialog */}
      <Dialog open={showBreakdown} onOpenChange={setShowBreakdown}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between bg-gray-900 text-white p-4 -m-6 mb-4">
            <DialogTitle className="text-lg font-medium">
              {selectedBreakdown?.title} {selectedBreakdown?.month}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBreakdown(false)}
              className="text-white hover:bg-gray-800 p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>

          {selectedBreakdown && (
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button className="px-4 py-2 bg-gray-800 text-white rounded text-sm font-medium">
                  Paid ({selectedBreakdown.items.length})
                </button>
                <button className="px-4 py-2 text-gray-600 rounded text-sm">
                  Budgets (0)
                </button>
                <div className="ml-auto">
                  <button className="px-4 py-2 text-gray-600 text-sm">
                    Notes
                  </button>
                </div>
              </div>

              {/* Section Title */}
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Full invoice payments ({selectedBreakdown.items.length})
                </h3>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {selectedBreakdown.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-blue-600 font-medium min-w-[80px]">
                          {item.date}
                        </span>
                        <span className="text-sm font-medium text-gray-900 flex-1">
                          {item.description}
                        </span>
                        <span className="text-sm text-gray-600 min-w-[80px]">
                          {item.invoiceNumber}
                        </span>
                        <span className="text-sm font-medium text-gray-900 min-w-[80px] text-right">
                          ${item.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    ${selectedBreakdown.total.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Paid this month</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    ${selectedBreakdown.expected.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Expected this month</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    ${selectedBreakdown.overExpected.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Over expected</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
