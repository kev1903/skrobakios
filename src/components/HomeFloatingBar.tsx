import React, { useState, useEffect } from 'react';
import { Search, User, Menu, Settings, HelpCircle, Briefcase, Calendar, DollarSign, TrendingUp, Map, ClipboardList, Calendar as CalendarIcon, Inbox } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { useProjects, Project } from '@/hooks/useProjects';
import { ProjectList } from '@/components/ProjectList';
import { TaskManagement } from '@/components/TaskManagement';
import { FinancePage } from '@/components/FinancePage';
import { SalesPage } from '@/components/SalesPage';
import { Mapbox3DEnvironment } from '@/components/Mapbox3DEnvironment';
import { SettingsPage } from '@/components/SettingsPage';
import { SupportPage } from '@/components/SupportPage';
interface HomeFloatingBarProps {
  onNavigate: (page: string) => void;
  onSelectProject?: (projectId: string) => void;
}
export const HomeFloatingBar = ({
  onNavigate,
  onSelectProject
}: HomeFloatingBarProps) => {
  const { userProfile } = useUser();
  const { getProjects } = useProjects();
  const [isRibbonOpen, setIsRibbonOpen] = useState(false);
  const [isProjectSectionOpen, setIsProjectSectionOpen] = useState(false);
  const [sidePageContent, setSidePageContent] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const fetchedProjects = await getProjects();
      setProjects(fetchedProjects.slice(0, 6)); // Show only first 6 projects
    };
    fetchProjects();
  }, [getProjects]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-300";
      case "running":
        return "bg-orange-500/20 text-orange-300";
      case "pending":
        return "bg-red-500/20 text-red-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "running":
        return "In Progress";
      case "pending":
        return "Pending";
      default:
        return "Active";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const toggleRibbon = () => {
    if (!isRibbonOpen) {
      // When opening ribbon, navigate to home and open ribbon
      onNavigate('home');
      setIsRibbonOpen(true);
      setSidePageContent(null); // Clear any side content
    } else {
      // When closing ribbon, just close it
      setIsRibbonOpen(false);
      setSidePageContent(null); // Clear side content
    }
  };

  const renderSidePageContent = () => {
    switch (sidePageContent) {
      case 'projects':
        return <ProjectList onNavigate={onNavigate} onSelectProject={onSelectProject} />;
      case 'tasks':
        return <TaskManagement onNavigate={onNavigate} />;
      case 'finance':
        return <FinancePage onNavigate={onNavigate} />;
      case 'sales':
        return <SalesPage onNavigate={onNavigate} />;
      case 'bim':
        return <Mapbox3DEnvironment onNavigate={onNavigate} />;
      case 'settings':
        return <SettingsPage onNavigate={onNavigate} />;
      case 'support':
        return <SupportPage />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed top-6 left-0 z-50 w-full">
        <div className="flex items-center justify-between py-0 px-6 mx-6">
        {/* Navigation Menu Icon */}
        <div className="flex-shrink-0 mr-4">
          <button 
            onClick={toggleRibbon}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Spacer for left side */}
        <div className="flex-shrink-0">
        </div>

        {/* Center - Spacer */}
        <div className="flex-1">
        </div>

        {/* Right side - Icons and User Profile */}
        <div className="flex-shrink-0 flex items-center gap-3">
          {/* Task Icon */}
          <button 
            onClick={() => onNavigate('tasks')} 
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
          >
            <ClipboardList className="w-5 h-5 text-white" />
          </button>
          
          {/* Schedule Icon */}
          <button 
            onClick={() => onNavigate('schedule')} 
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
          >
            <CalendarIcon className="w-5 h-5 text-white" />
          </button>
          
          {/* Inbox Icon */}
          <button 
            onClick={() => onNavigate('inbox')} 
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
          >
            <Inbox className="w-5 h-5 text-white" />
          </button>
          
          {/* User Profile */}
          <button onClick={() => onNavigate('user-edit')} className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200">
            <Avatar className="w-6 h-6">
              <AvatarImage src={userProfile.avatarUrl} alt="Profile" />
              <AvatarFallback className="bg-white/40 text-white text-xs">
                <User className="w-3 h-3" />
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>
    </div>

    {/* Navigation Ribbon */}
    {isRibbonOpen && (
      <div className="fixed left-0 top-0 w-48 h-full bg-white/10 backdrop-blur-md border-r border-white/20 shadow-2xl z-40 transition-all duration-300">
        <div className="flex flex-col h-full pt-20">
          {/* Navigation Items */}
          <div className="flex-1 flex flex-col py-4 space-y-1 overflow-y-auto px-3">
            <button
              onClick={() => {
                setSidePageContent('projects');
                setIsProjectSectionOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
            >
              <Briefcase className="w-4 h-4" />
              <span className="text-sm font-medium">Projects</span>
            </button>
            <button
              onClick={() => {
                setSidePageContent('tasks');
                setIsRibbonOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Tasks</span>
            </button>
            <button
              onClick={() => {
                setSidePageContent('finance');
                setIsRibbonOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
            >
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">Finance</span>
            </button>
            <button
              onClick={() => {
                onNavigate('sales'); // Navigate to full-screen sales page
                setIsRibbonOpen(false); // Close the ribbon completely
                setSidePageContent(null); // Clear side content
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Sales</span>
            </button>
            <button
              onClick={() => {
                setSidePageContent('bim');
                setIsRibbonOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
            >
              <Map className="w-4 h-4" />
              <span className="text-sm font-medium">BIM</span>
            </button>
          </div>

          {/* Support Section */}
          <div className="border-t border-white/20 px-3 py-4 space-y-1">
            <div className="text-xs font-medium text-white uppercase tracking-wider px-3 py-2">
              Support
            </div>
            <button
              onClick={() => {
                setSidePageContent('settings');
                setIsRibbonOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Settings</span>
            </button>
            <button
              onClick={() => {
                setSidePageContent('support');
                setIsRibbonOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Help Center</span>
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Side Page Content */}
    {isRibbonOpen && sidePageContent && (
      <div className="fixed left-48 top-0 right-0 h-full z-30 bg-white/5 backdrop-blur-sm">
        <div className="h-full overflow-hidden relative">
          {/* Close button for side content */}
          <button
            onClick={() => setSidePageContent(null)}
            className="absolute top-4 right-4 z-50 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
          >
            <span className="text-white text-lg">×</span>
          </button>
          {renderSidePageContent()}
        </div>
      </div>
    )}

    {/* Project Section - Full Screen */}
    {isProjectSectionOpen && (
      <div className="fixed inset-0 z-40 pt-24 pb-24">
        <div 
          className="w-full h-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <h2 className="text-2xl font-semibold text-white">Projects</h2>
            <button
              onClick={() => setIsProjectSectionOpen(false)}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
            >
              <span className="text-white text-lg">×</span>
            </button>
          </div>
          
          {/* Project Content */}
          <div className="p-6 h-full overflow-y-auto">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors duration-200">
                  <h3 className="text-white font-semibold text-lg mb-3">{project.name}</h3>
                  <p className="text-white text-sm mb-4">{project.description || 'No description available'}</p>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                    {project.deadline && (
                      <span className="text-white text-xs">Due: {formatDate(project.deadline)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => {
                  onNavigate('projects');
                  setIsProjectSectionOpen(false);
                }}
                className="bg-white/20 hover:bg-white/30 text-white py-3 px-8 rounded-xl border border-white/30 transition-colors duration-200 font-medium"
              >
                View All Projects
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Overlay to close ribbon when clicking outside */}
    {isRibbonOpen && !sidePageContent && (
      <div 
        className="fixed inset-0 bg-black/20 z-30"
        onClick={() => setIsRibbonOpen(false)}
      />
    )}
    
    {/* Overlay to close project section when clicking outside */}
    {isProjectSectionOpen && (
      <div 
        className="fixed inset-0 bg-black/20 z-30"
        onClick={() => setIsProjectSectionOpen(false)}
      />
    )}
  </>
  );
};