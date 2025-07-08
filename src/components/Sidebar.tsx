
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
    <div className="w-64 glass-sidebar flex flex-col shadow-2xl shadow-black/10">
      <div className="p-6 border-b border-white/20 glass-light">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <File className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground heading-modern">SKROBAKI</h1>
            <p className="text-sm text-sidebar-foreground/70 body-modern">Construction Management</p>
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
                "w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-300",
                currentPage === item.id
                  ? "bg-sidebar-accent text-sidebar-primary border border-sidebar-primary/30 shadow-lg"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:shadow-md"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium heading-modern">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border glass-light">
        <div className="flex items-center space-x-3 px-4 py-2 rounded-lg glass">
          <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center shadow-md">
            <User className="w-4 h-4 text-sidebar-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-sidebar-foreground heading-modern">Demo User</p>
            <p className="text-xs text-sidebar-foreground/70 body-modern">demo@skrobaki.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};
