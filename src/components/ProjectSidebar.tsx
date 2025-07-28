
import { ArrowLeft, BarChart3, Calendar, CheckSquare, Settings, Eye, HelpCircle, Boxes, FileText, DollarSign, Users } from "lucide-react";
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
  icon: Eye,
  page: 'project-detail'
}, {
  id: 'tasks',
  key: 'tasks',
  label: 'Tasks',
  icon: CheckSquare,
  page: 'project-tasks'
}, {
  id: 'timeline',
  key: 'timeline',
  label: 'Timeline',
  icon: Calendar,
  page: 'project-timeline'
}, {
  id: 'team',
  key: 'team',
  label: 'Team',
  icon: Users,
  page: 'project-team'
}, {
  id: 'specification',
  key: 'specification',
  label: 'Specification',
  icon: FileText,
  page: 'project-specification'
}, {
  id: 'cost',
  key: 'cost',
  label: 'Cost',
  icon: DollarSign,
  page: 'project-cost'
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
    onNavigate(page);
  };

  // Filter project navigation items based on subscription features
  const hasProjectManagement = hasFeature('projects');
  const enabledProjectNavItems = hasProjectManagement ? ALL_PROJECT_NAV_ITEMS : [];

  // Responsive classes based on screen size
  const sidebarClasses = {
    mobile: "w-full h-full glass-sidebar",
    tablet: "w-full h-full glass-sidebar",
    desktop: "fixed left-0 top-0 w-48 h-full glass-sidebar z-50"
  };

  const contentClasses = {
    mobile: "flex flex-col h-full px-4 py-6",
    tablet: "flex flex-col h-full px-3 py-4",
    desktop: "flex flex-col h-full pt-20"
  };

  return (
    <div className={`${sidebarClasses[screenSize]} transition-all duration-300`}>
      <div className={contentClasses[screenSize]}>
        {/* Project Info */}
        <div className={`flex-shrink-0 ${screenSize === 'mobile' ? 'mb-6' : 'px-3 py-4'} ${screenSize !== 'mobile' ? 'border-b border-white/20' : ''}`}>
          <div className="text-slate-700 text-sm font-medium mb-2 truncate">{project.name}</div>
          <div className="text-slate-500 text-xs mb-2">#{project.project_id}</div>
          <Badge variant="outline" className={`${getStatusColor(project.status)} text-xs`}>
            {getStatusText(project.status)}
          </Badge>
        </div>

        {/* Back Button */}
        <div className={`flex-shrink-0 ${screenSize === 'mobile' ? 'mb-6' : 'px-3 py-2 border-b border-white/20'}`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('projects')}
            className={`${screenSize === 'mobile' ? 'w-full' : 'w-full'} flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-white/10 transition-all duration-200 text-left justify-start`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Projects</span>
          </Button>
        </div>

        {/* Project Navigation Items - Only show if Projects module is enabled */}
        <div className={`flex-1 flex flex-col ${screenSize === 'mobile' ? 'space-y-2' : 'py-4 space-y-1'} overflow-y-auto ${screenSize !== 'mobile' ? 'px-3' : ''}`}>
          <div className={`text-xs font-medium text-slate-500 uppercase tracking-wider ${screenSize === 'mobile' ? 'mb-3' : 'px-3 py-2 mb-1'}`}>
            Project Navigation
          </div>
          
          {!hasProjectManagement && (
            <div className={`${screenSize === 'mobile' ? 'py-4 text-center' : 'px-3 py-4'} text-slate-500 text-sm ${screenSize === 'mobile' ? '' : 'text-center'}`}>
              Upgrade subscription for project features
            </div>
          )}
          
          {enabledProjectNavItems.length === 0 && hasProjectManagement && (
            <div className={`${screenSize === 'mobile' ? 'py-4 text-center' : 'px-3 py-4'} text-slate-500 text-sm ${screenSize === 'mobile' ? '' : 'text-center'}`}>
              No project modules available
            </div>
          )}
          
          {enabledProjectNavItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => handleNavigate(item.page)} 
              className={`w-full flex items-center gap-3 ${screenSize === 'mobile' ? 'px-4 py-4' : 'px-3 py-3'} rounded-lg transition-all duration-200 text-left animate-fade-in ${
                activeSection === item.id 
                  ? 'bg-white/20 text-slate-700 border border-white/30' 
                  : 'text-slate-600 hover:bg-white/10 hover:text-slate-700'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className={`${screenSize === 'mobile' ? 'text-base' : 'text-sm'} font-medium`}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Project Settings */}
        <div className={`${screenSize !== 'mobile' ? 'border-t border-white/20 px-3 py-4' : 'mt-6 pt-6 border-t border-white/20'} space-y-1`}>
          <div className={`text-xs font-medium text-slate-500 uppercase tracking-wider ${screenSize === 'mobile' ? 'mb-3' : 'px-3 py-2'}`}>
            Project Settings
          </div>
          <button 
            onClick={() => handleNavigate('project-settings')} 
            className={`w-full flex items-center gap-3 ${screenSize === 'mobile' ? 'px-4 py-4' : 'px-3 py-3'} rounded-lg text-slate-600 hover:bg-white/10 hover:text-slate-700 transition-all duration-200 text-left`}
          >
            <Settings className="w-4 h-4" />
            <span className={`${screenSize === 'mobile' ? 'text-base' : 'text-sm'} font-medium`}>Settings</span>
          </button>
          <button 
            onClick={() => handleNavigate('support')} 
            className={`w-full flex items-center gap-3 ${screenSize === 'mobile' ? 'px-4 py-4' : 'px-3 py-3'} rounded-lg text-slate-600 hover:bg-white/10 hover:text-slate-700 transition-all duration-200 text-left`}
          >
            <HelpCircle className="w-4 h-4" />
            <span className={`${screenSize === 'mobile' ? 'text-base' : 'text-sm'} font-medium`}>Help</span>
          </button>
        </div>
      </div>
    </div>
  );
};
