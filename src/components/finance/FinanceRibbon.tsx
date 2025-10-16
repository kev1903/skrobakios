import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  Receipt,
  CreditCard,
  Wallet,
  PieChart,
  FileText,
  Settings,
  ArrowLeft
} from "lucide-react";

interface FinanceRibbonProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onBack?: () => void;
}

export const FinanceRibbon = ({ activeTab, onTabChange, onBack }: FinanceRibbonProps) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Income', icon: TrendingUp, badge: '24' },
    { id: 'expenses', label: 'Expenses', icon: Receipt, badge: '12' },
    { id: 'invoices', label: 'Invoices', icon: FileText, badge: '8' },
    { id: 'bills', label: 'Bills', icon: CreditCard, badge: '5' },
    { id: 'cashflow', label: 'Cash Flow', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'recurring', label: 'Recurring', icon: DollarSign },
  ];

  const supportItems = [
    { id: 'finance-settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 h-full bg-card/50 backdrop-blur-xl border-r border-border/50 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold text-foreground">Finance</h2>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="mb-4">
          <p className="text-xs font-medium text-muted-foreground mb-2 px-3">FINANCIAL MODULES</p>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start mb-1 h-10"
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        <div className="pt-4 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-2 px-3">SETTINGS</p>
          {supportItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start mb-1 h-10"
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
