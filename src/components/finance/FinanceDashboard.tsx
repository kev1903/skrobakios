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
import { useScreenSize } from "@/hooks/use-mobile";

export const FinanceDashboard = () => {
  const screenSize = useScreenSize();
  const isMobile = screenSize === 'mobile' || screenSize === 'mobile-small';
  
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
    <div className="w-full">
      <div className={`${isMobile ? 'p-4 space-y-4' : 'p-6 space-y-6'}`}>
        {/* Header */}
        <div className={isMobile ? 'mb-4' : 'mb-6'}>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-foreground mb-2`}>
            Financial Dashboard
          </h1>
          <p className="text-sm font-inter text-muted-foreground">Company financial overview and key metrics</p>
        </div>

        {/* Alerts */}
        <FinanceAlerts />

        {/* Overview Cards */}
        <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'md:grid-cols-2 lg:grid-cols-4 gap-6'}`}>
          {overviewCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card 
                key={card.title} 
                className="border border-border/30 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-200 hover:scale-[1.02]"
              >
                <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-3 ${isMobile ? 'p-4' : 'p-6'}`}>
                  <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {card.title}
                  </CardTitle>
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'} pt-0`}>
                  <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-foreground mb-2`}>{card.value}</div>
                  <div className="flex items-center">
                    {card.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-rose-500 mr-1" />
                    )}
                    <p className={`text-sm font-medium ${card.trend === "up" ? "text-emerald-500" : "text-rose-500"}`}>
                      {card.change}
                    </p>
                    <p className="text-sm text-muted-foreground ml-2">{card.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Cash Flow Section */}
        <CashFlowSection />

        {/* Two Column Layout */}
        <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'lg:grid-cols-2 gap-6'}`}>
          {/* Recent Activity */}
          <Card className="border border-border/30 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
            <CardHeader className="p-6">
              <CardTitle className="flex items-center space-x-2 text-lg font-bold">
                <Activity className="w-5 h-5 text-luxury-gold" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription className="text-sm">Latest financial transactions</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-3">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div 
                      key={index} 
                      className="flex items-start justify-between p-4 rounded-xl bg-accent/20 hover:bg-accent/30 transition-all duration-200 hover:scale-[1.01]"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2.5 rounded-full bg-white shadow-sm ${activity.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{activity.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{activity.project}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                        </div>
                      </div>
                      <p className={`text-sm font-semibold font-mono ${activity.color}`}>{activity.amount}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Financial Metrics */}
          <Card className="border border-border/30 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
            <CardHeader className="p-6">
              <CardTitle className="flex items-center space-x-2 text-lg font-bold">
                <PieChart className="w-5 h-5 text-luxury-gold" />
                <span>Key Financial Metrics</span>
              </CardTitle>
              <CardDescription className="text-sm">Business health indicators</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-3">
                {financialMetrics.map((metric) => {
                  const Icon = metric.icon;
                  const statusColors = {
                    healthy: "text-emerald-500",
                    strong: "text-luxury-gold",
                    improving: "text-amber-500",
                    critical: "text-rose-500"
                  };
                  
                  return (
                    <div key={metric.label} className="flex items-center justify-between p-4 rounded-xl bg-accent/20">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{metric.label}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-foreground">{metric.value}</p>
                        <p className={`text-xs font-medium capitalize ${statusColors[metric.status as keyof typeof statusColors]}`}>
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
        <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'lg:grid-cols-3 gap-6'}`}>
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
