import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target
} from "lucide-react";
import { FinanceAlerts } from "./FinanceAlerts";
import { CashFlowSection } from "./CashFlowSection";
import { ProfitabilitySection } from "./ProfitabilitySection";
import { ReceivablesSection } from "./ReceivablesSection";
import { ExpensesSection } from "./ExpensesSection";
import { FinancialRatiosSection } from "./FinancialRatiosSection";
import { ComplianceSection } from "./ComplianceSection";

export const FinanceDashboard = () => {
  const overviewCards = [
    {
      title: "Total Revenue",
      value: "$2.4M",
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
      description: "vs last month",
      color: "text-primary"
    },
    {
      title: "Net Profit",
      value: "$485K",
      change: "+8.2%",
      trend: "up" as const,
      icon: TrendingUp,
      description: "Profit margin: 20.2%",
      color: "text-success"
    },
    {
      title: "Total Expenses",
      value: "$1.9M",
      change: "+5.3%",
      trend: "up" as const,
      icon: TrendingDown,
      description: "Operating costs",
      color: "text-warning"
    },
    {
      title: "Cash Position",
      value: "$485K",
      change: "-3.8%",
      trend: "down" as const,
      icon: Wallet,
      description: "Available cash",
      color: "text-accent"
    }
  ];

  const recentActivity = [
    {
      type: "income",
      title: "Invoice Payment Received",
      project: "Collins St Renovation",
      amount: "+$45,200",
      date: "2 hours ago",
      icon: ArrowUpRight,
      color: "text-success"
    },
    {
      type: "expense",
      title: "Material Purchase",
      project: "Martin Place Project",
      amount: "-$12,500",
      date: "5 hours ago",
      icon: ArrowDownRight,
      color: "text-destructive"
    },
    {
      type: "income",
      title: "Project Milestone Payment",
      project: "Queen St Development",
      amount: "+$28,000",
      date: "Yesterday",
      icon: ArrowUpRight,
      color: "text-success"
    },
    {
      type: "expense",
      title: "Subcontractor Payment",
      project: "Collins St Renovation",
      amount: "-$18,900",
      date: "Yesterday",
      icon: ArrowDownRight,
      color: "text-destructive"
    }
  ];

  const financialMetrics = [
    { label: "Profit Margin", value: "20.2%", status: "healthy", icon: Target },
    { label: "Current Ratio", value: "2.4", status: "strong", icon: Activity },
    { label: "Operating Margin", value: "12.5%", status: "improving", icon: PieChart },
    { label: "Cash Runway", value: "3.9 months", status: "critical", icon: Wallet }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Financial Dashboard</h1>
          <p className="text-muted-foreground">Company financial overview and key metrics</p>
        </div>

        {/* Alerts */}
        <FinanceAlerts />

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {overviewCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{card.value}</div>
                  <div className="flex items-center mt-1">
                    {card.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 text-success mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-destructive mr-1" />
                    )}
                    <p className={`text-xs ${card.trend === "up" ? "text-success" : "text-destructive"}`}>
                      {card.change}
                    </p>
                    <p className="text-xs text-muted-foreground ml-2">{card.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Cash Flow Section */}
        <CashFlowSection />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-primary" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Latest financial transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full bg-background ${activity.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.project}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                        </div>
                      </div>
                      <p className={`text-sm font-semibold ${activity.color}`}>{activity.amount}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Financial Metrics */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-primary" />
                <span>Key Financial Metrics</span>
              </CardTitle>
              <CardDescription>Business health indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialMetrics.map((metric) => {
                  const Icon = metric.icon;
                  const statusColors = {
                    healthy: "text-success",
                    strong: "text-primary",
                    improving: "text-warning",
                    critical: "text-destructive"
                  };
                  
                  return (
                    <div key={metric.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{metric.label}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">{metric.value}</p>
                        <p className={`text-xs capitalize ${statusColors[metric.status as keyof typeof statusColors]}`}>
                          {metric.status}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profitability Section */}
        <ProfitabilitySection />

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ReceivablesSection />
          <ExpensesSection />
          <FinancialRatiosSection />
        </div>

        {/* Compliance Section */}
        <ComplianceSection />
      </div>
    </div>
  );
};
