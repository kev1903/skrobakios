
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
  Globe,
  ArrowLeft
} from 'lucide-react';

interface SalesRibbonProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onBack?: () => void;
}

export const SalesRibbon = ({ activeTab, onTabChange, onBack }: SalesRibbonProps) => {
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

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="fixed left-0 top-0 w-16 h-full bg-white border-r border-gray-200 flex flex-col shadow-lg z-50">
      {/* Back Button Header */}
      <div className="flex-shrink-0 p-2 border-b border-gray-200">
        <button
          onClick={handleBack}
          className="w-12 h-12 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 group relative"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
          
          {/* Tooltip */}
          <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
            Back to Dashboard
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
          </div>
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col items-center py-4 space-y-2 overflow-y-auto">
        {ribbonItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 group relative flex-shrink-0",
                isActive
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:scale-105"
              )}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                {item.label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
