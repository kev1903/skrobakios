
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
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <File className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">EstimateAI</h1>
            <p className="text-sm text-gray-500">Construction Estimating</p>
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
                "w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors",
                currentPage === item.id
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 px-4 py-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Demo User</p>
            <p className="text-xs text-gray-500">demo@estimateai.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};
