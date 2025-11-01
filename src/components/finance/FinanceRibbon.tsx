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
    <div className="w-80 h-full bg-background border-r border-border/30 flex flex-col flex-shrink-0">
      {/* Header - Back Button */}
      <div className="p-4 border-b border-border/30">
        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="w-full justify-start gap-2 px-3 py-2 h-auto text-sm font-medium hover:bg-accent/30 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Finance</span>
          </Button>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground mb-3 px-3 uppercase tracking-wider">Financial Modules</p>
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${
                    isActive 
                      ? 'bg-luxury-gold/10 text-luxury-gold font-medium' 
                      : 'text-muted-foreground hover:bg-accent/30 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge 
                      variant="secondary" 
                      className={`h-5 px-2 text-xs rounded-md ${
                        isActive ? 'bg-luxury-gold/20 text-luxury-gold' : 'bg-muted/50'
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-muted-foreground mb-3 px-3 uppercase tracking-wider">Settings</p>
          <div className="space-y-1">
            {supportItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${
                    isActive 
                      ? 'bg-luxury-gold/10 text-luxury-gold font-medium' 
                      : 'text-muted-foreground hover:bg-accent/30 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
