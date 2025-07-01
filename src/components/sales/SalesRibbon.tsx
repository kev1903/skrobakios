
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
    <div className="fixed left-0 top-0 w-64 h-full bg-white border-r border-gray-200 flex flex-col shadow-lg z-50">
      {/* Back Button Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <button
          onClick={handleBack}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col py-4 space-y-1 overflow-y-auto px-3">
        {ribbonItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left",
                isActive
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
