
import React from 'react';
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard,
  Users,
  UserCheck,
  FolderOpen,
  FileText,
  Send,
  Settings,
  Globe
} from 'lucide-react';

interface SalesRibbonProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const SalesRibbon = ({ activeTab, onTabChange }: SalesRibbonProps) => {
  const ribbonItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'clients', label: 'Clients', icon: UserCheck },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'estimates', label: 'Estimates', icon: FileText },
    { id: 'submittals', label: 'Submittals', icon: Send },
    { id: 'portal', label: 'Portal', icon: Globe },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-2">
      {ribbonItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 group relative",
              isActive
                ? "bg-blue-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
            title={item.label}
          >
            <Icon className="w-5 h-5" />
            
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              {item.label}
            </div>
          </button>
        );
      })}
    </div>
  );
};
