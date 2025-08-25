
import { ArrowLeft, BarChart3, Calendar, CheckSquare, Settings, Eye, HelpCircle, Boxes, FileText, DollarSign, Users, FileSignature, ClipboardCheck, ShoppingCart, LayoutDashboard, Square, CalendarRange, User, File, ShoppingBag, CreditCard, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/hooks/useProjects";
import { useCompany } from "@/contexts/CompanyContext";
import { useSubscription } from '@/hooks/useSubscription';
import { useScreenSize } from "@/hooks/use-mobile";
import { useEffect } from "react";

interface ProjectSidebarProps {
  project: Project;
  onNavigate: (page: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  activeSection?: string;
}

// Define all available project navigation modules
const ALL_PROJECT_NAV_ITEMS = [{
  id: 'dashboard',
  key: 'dashboard',
  label: 'Dashboard',
  icon: LayoutDashboard,
  page: 'project-detail'
}, {
  id: 'tasks',
  key: 'tasks',
  label: 'Tasks',
  icon: Square,
  page: 'project-tasks'
}, {
  id: 'timeline',
  key: 'timeline',
  label: 'Timeline',
  icon: CalendarRange,
  page: 'project-timeline'
}, {
  id: 'team',
  key: 'team',
  label: 'Team',
  icon: User,
  page: 'project-team'
}, {
  id: 'specification',
  key: 'specification',
  label: 'Specification',
  icon: File,
  page: 'project-specification'
}, {
  id: 'procurement',
  key: 'procurement',
  label: 'Procurement',
  icon: ShoppingBag,
  page: 'project-procurement'
}, {
  id: 'cost',
  key: 'cost',
  label: 'Cost',
  icon: CreditCard,
  page: 'project-cost'
}, {
  id: 'contracts',
  key: 'contracts',
  label: 'Contracts',
  icon: FileText,
  page: 'project-contracts'
}, {
  id: 'qaqc',
  key: 'qaqc',
  label: 'QA/QC',
  icon: Shield,
  page: 'project-qaqc'
}];

export const ProjectSidebar = ({
  project,
  onNavigate,
  getStatusColor,
  getStatusText,
  activeSection = "insights"
}: ProjectSidebarProps) => {
  const { currentCompany } = useCompany();
  const { hasFeature } = useSubscription();
  const screenSize = useScreenSize();
  
  const handleNavigate = (page: string) => {
    console.log(`🧭 ProjectSidebar: Navigating to ${page} with project ${project.id}`);
    
    // Ensure we include the projectId in the URL for all project pages
    if (page.startsWith('project-')) {
      const url = `${page}?projectId=${project.id}`;
      console.log(`🧭 ProjectSidebar: Full URL: ${url}`);
      onNavigate(url);
    } else {
      onNavigate(page);
    }
  };

  // Filter project navigation items based on subscription features
  const hasProjectManagement = hasFeature('projects');
  const enabledProjectNavItems = hasProjectManagement ? ALL_PROJECT_NAV_ITEMS : [];

  // Responsive classes based on screen size - Exact match to Project Tasks page
  const sidebarClasses = {
    mobile: "w-full h-screen bg-white border-r border-gray-200",
    tablet: "w-full h-screen bg-white border-r border-gray-200", 
    desktop: "fixed left-0 top-0 w-48 h-screen bg-white border-r border-gray-200 z-50"
  };

  const contentClasses = {
    mobile: "flex flex-col h-screen px-0 py-0",
    tablet: "flex flex-col h-screen px-0 py-0",
    desktop: "flex flex-col h-screen px-0 py-0"
  };

  return (
    <div className={`${sidebarClasses[screenSize]} transition-all duration-300`}>
      <div className={contentClasses[screenSize]}>
        {/* Project Info */}
        <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200">
          <div className="text-slate-600 text-sm mb-1 truncate">{project.name}</div>
          <div className="text-slate-400 text-xs mb-2">#{project.project_id}</div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {getStatusText(project.status)}
          </span>
        </div>

        {/* Back Button */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('projects')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-slate-600 hover:bg-gray-50 transition-colors text-left justify-start text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </Button>
        </div>

        {/* Project Navigation Items */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-4 py-4">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
              Project Navigation
            </div>
            
            {!hasProjectManagement && (
              <div className="text-slate-500 text-sm py-4">
                Upgrade subscription for project features
              </div>
            )}
            
            {enabledProjectNavItems.length === 0 && hasProjectManagement && (
              <div className="text-slate-500 text-sm py-4">
                No project modules available
              </div>
            )}
          
            {enabledProjectNavItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => handleNavigate(item.page)} 
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left text-sm ${
                  activeSection === item.id 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-slate-600 hover:bg-gray-50 hover:text-slate-700'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Project Settings */}
        <div className="flex-shrink-0 border-t border-gray-200 px-4 py-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
            Project Settings
          </div>
          <div className="space-y-1">
            <button 
              onClick={() => handleNavigate('project-settings')} 
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-600 hover:bg-gray-50 hover:text-slate-700 transition-colors text-left text-sm"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button 
              onClick={() => handleNavigate('support')} 
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-600 hover:bg-gray-50 hover:text-slate-700 transition-colors text-left text-sm"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
