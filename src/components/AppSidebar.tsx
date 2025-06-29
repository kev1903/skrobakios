
import { 
  Home, 
  Calendar, 
  Mail, 
  BarChart3, 
  File, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  HelpCircle, 
  LogOut,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const AppSidebar = ({ currentPage, onNavigate }: AppSidebarProps) => {
  const generalNavigation = [
    { id: "tasks", label: "My Tasks", icon: Home, active: true },
    { id: "schedules", label: "My Schedules", icon: Calendar },
    { id: "inbox", label: "Inbox", icon: Mail },
  ];

  const businessNavigation = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "files", label: "Files", icon: File },
    { id: "create-project", label: "Projects", icon: Briefcase },
    { id: "asset", label: "Asset", icon: DollarSign },
    { id: "finance", label: "Finance", icon: TrendingUp },
    { id: "sales", label: "Sales", icon: TrendingUp },
  ];

  const supportNavigation = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "support", label: "Help Center", icon: HelpCircle },
  ];

  return (
    <div className="w-64 glass-sidebar flex flex-col h-full animate-slide-in">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg font-poppins">K</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient heading-modern">KAKSIK</h1>
            <p className="text-xs text-gray-500 font-inter">Modern Workspace</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-6">
        {/* General Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 font-poppins">
            General
          </h3>
          <div className="space-y-1">
            {generalNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === "tasks";
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 text-sm font-inter group",
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 font-medium shadow-lg backdrop-blur-sm border border-blue-500/20"
                      : "text-gray-600 hover:bg-white/10 hover:text-gray-800 hover:backdrop-blur-sm hover:shadow-md"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-all duration-200",
                    isActive ? "text-blue-500" : "text-gray-500 group-hover:text-gray-700"
                  )} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Business Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 font-poppins">
            Business
          </h3>
          <div className="space-y-1">
            {businessNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 text-sm font-inter group",
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 font-medium shadow-lg backdrop-blur-sm border border-blue-500/20"
                      : "text-gray-600 hover:bg-white/10 hover:text-gray-800 hover:backdrop-blur-sm hover:shadow-md"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-all duration-200",
                    isActive ? "text-blue-500" : "text-gray-500 group-hover:text-gray-700"
                  )} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Support Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 font-poppins">
            Support
          </h3>
          <div className="space-y-1">
            {supportNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 text-sm font-inter group",
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 font-medium shadow-lg backdrop-blur-sm border border-blue-500/20"
                      : "text-gray-600 hover:bg-white/10 hover:text-gray-800 hover:backdrop-blur-sm hover:shadow-md"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-all duration-200",
                    isActive ? "text-blue-500" : "text-gray-500 group-hover:text-gray-700"
                  )} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10">
        <button className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl hover:bg-white/10 transition-all duration-200 group backdrop-blur-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate font-poppins">Wade Warren</p>
            <p className="text-xs text-gray-500 truncate font-inter">UI UX Designer</p>
          </div>
        </button>
        <button className="w-full flex items-center space-x-3 px-4 py-2 mt-2 text-left rounded-xl hover:bg-red-50/50 transition-all duration-200 text-gray-500 hover:text-red-600 group backdrop-blur-sm">
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-inter">Logout</span>
        </button>
      </div>
    </div>
  );
};
