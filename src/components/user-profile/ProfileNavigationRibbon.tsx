import React from 'react';
import { cn } from "@/lib/utils";
import { 
  User,
  Briefcase,
  Building2,
  Lock,
  ArrowLeft
} from 'lucide-react';

interface ProfileNavigationRibbonProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onBack: () => void;
}

export const ProfileNavigationRibbon = ({ activeTab, onTabChange, onBack }: ProfileNavigationRibbonProps) => {
  const navigationItems = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="fixed left-0 top-0 w-48 h-full glass-sidebar z-40 transition-all duration-300">
      {/* Back Button Header */}
      <div className="flex-shrink-0 p-4 border-b border-sidebar-border">
        <button
          onClick={onBack}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col py-4 space-y-1 overflow-y-auto px-3">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sidebar-foreground transition-all duration-200 text-left",
              activeTab === item.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "hover:bg-sidebar-accent/50"
            )}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Summary */}
      <div className="border-t border-sidebar-border px-3 py-4">
        <div className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider px-3 py-2">
          Profile Settings
        </div>
        <div className="px-3 py-2 text-xs text-sidebar-foreground/60">
          Update your personal and professional information
        </div>
      </div>
    </div>
  );
};