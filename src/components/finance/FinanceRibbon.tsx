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
    <div className="w-80 h-full bg-white/80 backdrop-blur-xl border-r border-border/30 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-border/30">
        <div className="flex items-center justify-between mb-6">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-10 w-10 rounded-full hover:scale-[1.02] transition-all duration-200 hover:bg-accent/50"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1 text-center">
            <h2 className="text-xl font-playfair font-bold text-foreground">Finance</h2>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-6 space-y-1">
        <div className="mb-6">
          <p className="text-[11px] font-semibold text-muted-foreground mb-3 px-3 uppercase tracking-wider">Financial Modules</p>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full justify-start mb-1 h-14 px-6 py-4 rounded-2xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-luxury-gold text-white shadow-md hover:shadow-lg hover:scale-[1.02]' 
                    : 'hover:bg-accent/30 hover:scale-[1.01]'
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="mr-3 h-5 w-5" />
                <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant="secondary" 
                    className={`ml-2 h-6 px-2.5 text-xs rounded-full font-medium ${
                      isActive ? 'bg-white/20 text-white' : 'bg-muted/50'
                    }`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        <div className="pt-6 border-t border-border/30">
          <p className="text-[11px] font-semibold text-muted-foreground mb-3 px-3 uppercase tracking-wider">Settings</p>
          {supportItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full justify-start mb-1 h-14 px-6 py-4 rounded-2xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-luxury-gold text-white shadow-md hover:shadow-lg hover:scale-[1.02]' 
                    : 'hover:bg-accent/30 hover:scale-[1.01]'
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="mr-3 h-5 w-5" />
                <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
