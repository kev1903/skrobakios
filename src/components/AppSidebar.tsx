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
import { useUser } from "@/contexts/UserContext";

interface AppSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const AppSidebar = ({ currentPage, onNavigate }: AppSidebarProps) => {
  const { userProfile } = useUser();

  const generalNavigation = [
    { id: "tasks", label: "My Tasks", icon: Home, active: true },
    { id: "schedules", label: "My Schedules", icon: Calendar },
    { id: "inbox", label: "Inbox", icon: Mail },
  ];

  const businessNavigation = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "files", label: "Files", icon: File },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "asset", label: "Asset", icon: DollarSign },
    { id: "finance", label: "Finance", icon: TrendingUp },
    { id: "sales", label: "Sales", icon: TrendingUp },
  ];

  const supportNavigation = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "support", label: "Help Center", icon: HelpCircle },
  ];

  return (
    <div className="w-64 bg-white/95 backdrop-blur-sm border-r border-white/20 flex flex-col h-full animate-slide-in">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm font-poppins">K</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gradient heading-modern">KAKSIK</h1>
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
                    "w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 text-sm font-inter group",
                    isActive
                      ? "bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700 font-medium backdrop-blur-sm border border-gray-500/20"
                      : "text-gray-600 hover:bg-white/10 hover:text-gray-800 hover:backdrop-blur-sm"
                  )}
                >
                  <Icon className={cn(
                    "w-4 h-4 transition-all duration-200",
                    isActive ? "text-gray-600" : "text-gray-500 group-hover:text-gray-700"
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
                    "w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 text-sm font-inter group",
                    isActive
                      ? "bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700 font-medium backdrop-blur-sm border border-gray-500/20"
                      : "text-gray-600 hover:bg-white/10 hover:text-gray-800 hover:backdrop-blur-sm"
                  )}
                >
                  <Icon className={cn(
                    "w-4 h-4 transition-all duration-200",
                    isActive ? "text-gray-600" : "text-gray-500 group-hover:text-gray-700"
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
                    "w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 text-sm font-inter group",
                    isActive
                      ? "bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700 font-medium backdrop-blur-sm border border-gray-500/20"
                      : "text-gray-600 hover:bg-white/10 hover:text-gray-800 hover:backdrop-blur-sm"
                  )}
                >
                  <Icon className={cn(
                    "w-4 h-4 transition-all duration-200",
                    isActive ? "text-gray-600" : "text-gray-500 group-hover:text-gray-700"
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
        <button 
          onClick={() => onNavigate('user-edit')}
          className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg hover:bg-white/10 transition-all duration-200 group backdrop-blur-sm"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center overflow-hidden">
            {userProfile.avatarUrl ? (
              <img 
                src={userProfile.avatarUrl} 
                alt="User Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate font-poppins">
              {userProfile.firstName} {userProfile.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate font-inter">{userProfile.jobTitle}</p>
          </div>
        </button>
        <button className="w-full flex items-center space-x-3 px-3 py-2 mt-2 text-left rounded-lg hover:bg-red-50/50 transition-all duration-200 text-gray-500 hover:text-red-600 group backdrop-blur-sm">
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-inter">Logout</span>
        </button>
      </div>
    </div>
  );
};
