
import { Home, Upload, File, User, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar = ({ currentPage, onNavigate }: SidebarProps) => {
  const navigation = [
    { id: "dashboard", label: "Projects", icon: Home },
    { id: "upload", label: "Upload", icon: Upload },
    { id: "auth", label: "Account", icon: User },
    { id: "support", label: "Support", icon: HelpCircle },
  ];

  return (
    <div className="w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 flex flex-col shadow-2xl shadow-black/10">
      <div className="p-6 border-b border-white/20 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500/80 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg">
            <File className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">EstimateAI</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Construction Estimating</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-300 backdrop-blur-sm",
                currentPage === item.id
                  ? "bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-400/30 shadow-lg"
                  : "text-gray-600 dark:text-gray-300 hover:bg-white/10 hover:text-gray-900 dark:hover:text-white hover:shadow-md hover:backdrop-blur-md"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/20 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
          <div className="w-8 h-8 bg-gray-500/30 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
            <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Demo User</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">demo@estimateai.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};
