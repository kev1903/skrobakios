import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, FileText, Target, Calendar, Settings, ArrowLeft, Building2 } from 'lucide-react';
interface SalesRibbonProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onBack: () => void;
}
export const SalesRibbon = ({
  activeTab,
  onTabChange,
  onBack
}: SalesRibbonProps) => {
  const menuItems = [{
    id: 'dashboard',
    label: 'Opportunities',
    icon: BarChart3,
    badge: '1236'
  }, {
    id: 'leads',
    label: 'Lead Contacts',
    icon: Users,
    badge: null
  }, {
    id: 'clients',
    label: 'All Clients',
    icon: Building2,
    badge: null
  }, {
    id: 'projects',
    label: 'Projects',
    icon: Target,
    badge: null
  }, {
    id: 'estimates',
    label: 'Estimates',
    icon: FileText,
    badge: null
  }, {
    id: 'submittals',
    label: 'Submittals',
    icon: Calendar,
    badge: null
  }, {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    badge: null
  }];
  return <div className="w-64 glass-sidebar border-r border-white/20 h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0 hover:bg-white/10 text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="font-semibold text-foreground font-poppins">BACK</h2>
            <p className="text-xs text-muted-foreground font-inter">The CRM for your team</p>
          </div>
        </div>

      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map(item => <Button key={item.id} variant={activeTab === item.id ? 'secondary' : 'ghost'} className={`w-full justify-start text-left font-inter ${activeTab === item.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`} onClick={() => onTabChange(item.id)}>
              <item.icon className="w-4 h-4 mr-3" />
              <span className="flex-1">{item.label}</span>
              {item.badge && <Badge variant="secondary" className="ml-auto text-xs bg-primary/20 text-primary">
                  {item.badge}
                </Badge>}
            </Button>)}
        </div>

      </div>

      {/* Team Members */}
      <div className="p-4 border-t border-white/20">
        
      </div>
    </div>;
};