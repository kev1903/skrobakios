import React from 'react';
import { 
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
  SidebarProvider
} from '@/components/ui/sidebar';
import { ArrowLeft, BarChart3, Calendar, CheckSquare, Settings, Eye, HelpCircle, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Project } from "@/hooks/useProjects";
import { useCompany } from "@/contexts/CompanyContext";
import { useSubscription } from '@/hooks/useSubscription';

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
  id: 'schedule',
  key: 'schedule',
  label: 'Schedule',
  icon: Calendar,
  page: 'project-schedule'
}, {
  id: 'tasks',
  key: 'tasks',
  label: 'Tasks',
  icon: CheckSquare,
  page: 'project-tasks'
}];

const ProjectSidebarContent = ({
  project,
  onNavigate,
  getStatusColor,
  getStatusText,
  activeSection = "insights"
}: ProjectSidebarProps) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { currentCompany } = useCompany();
  const { hasFeature } = useSubscription();
  
  const handleNavigate = (page: string) => {
    onNavigate(page);
  };

  // Filter project navigation items based on subscription features
  const hasProjectManagement = hasFeature('projects');
  const enabledProjectNavItems = hasProjectManagement ? ALL_PROJECT_NAV_ITEMS : [];

  return (
    <Sidebar className="backdrop-blur-2xl bg-white/10 border-r border-white/20 shadow-2xl shadow-black/10">
      <SidebarHeader className="p-4 border-b border-white/20">
        {/* Project Name at the top */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm">
            <FolderOpen className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{project.name}</div>
              <div className="text-white/70 text-xs">#{project.project_id}</div>
            </div>
          )}
        </div>
        
        {/* Collapse Toggle Button */}
        <div className="flex justify-end">
          <SidebarTrigger className="text-white hover:bg-white/20" />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Project Navigation Items */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/60">
            {!isCollapsed && "Project Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {!hasProjectManagement && (
                <div className="px-3 py-4 text-white/60 text-sm text-center">
                  {!isCollapsed && "Upgrade subscription for project features"}
                </div>
              )}
              
              {enabledProjectNavItems.length === 0 && hasProjectManagement && (
                <div className="px-3 py-4 text-white/60 text-sm text-center">
                  {!isCollapsed && "No project modules available"}
                </div>
              )}
              
              {enabledProjectNavItems.map(item => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => handleNavigate(item.page)}
                    className={`text-white hover:bg-white/20 hover:text-white ${
                      activeSection === item.id 
                        ? 'bg-white/20 border border-white/30' 
                        : 'text-white/80'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Project Settings */}
        <SidebarGroup className="border-t border-white/20">
          <SidebarGroupLabel className="text-white/60">
            {!isCollapsed && "Project Settings"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => handleNavigate('project-settings')}
                  className="text-white/80 hover:bg-white/20 hover:text-white"
                >
                  <Settings className="w-4 h-4" />
                  {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => handleNavigate('support')}
                  className="text-white/80 hover:bg-white/20 hover:text-white"
                >
                  <HelpCircle className="w-4 h-4" />
                  {!isCollapsed && <span className="text-sm font-medium">Help</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export const ProjectSidebar = (props: ProjectSidebarProps) => {
  return (
    <SidebarProvider>
      <ProjectSidebarContent {...props} />
    </SidebarProvider>
  );
};