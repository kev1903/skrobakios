import React, { useState } from 'react';
import { Search, User, Menu, Settings, HelpCircle, Briefcase, Calendar, DollarSign, TrendingUp, Map } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
interface HomeFloatingBarProps {
  onNavigate: (page: string) => void;
}
export const HomeFloatingBar = ({
  onNavigate
}: HomeFloatingBarProps) => {
  const {
    userProfile
  } = useUser();
  const [isRibbonOpen, setIsRibbonOpen] = useState(false);
  const [isProjectSectionOpen, setIsProjectSectionOpen] = useState(false);

  const toggleRibbon = () => {
    setIsRibbonOpen(!isRibbonOpen);
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
            <Menu className="w-5 h-5 text-white/80" />
          </button>
        </div>

        {/* Spacer for left side */}
        <div className="flex-shrink-0">
        </div>

        {/* Center - Spacer */}
        <div className="flex-1">
        </div>

        {/* Right side - User Profile */}
        <div className="flex-shrink-0">
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
      <div className="fixed left-0 top-0 w-64 h-full bg-white/10 backdrop-blur-md border-r border-white/20 shadow-2xl z-40 transition-all duration-300">
        <div className="flex flex-col h-full pt-20">
          {/* Navigation Items */}
          <div className="flex-1 flex flex-col py-4 space-y-1 overflow-y-auto px-3">
            <button
              onClick={() => {
                setIsProjectSectionOpen(true);
                setIsRibbonOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
            >
              <Briefcase className="w-4 h-4" />
              <span className="text-sm font-medium">Projects</span>
            </button>
            <button
              onClick={() => {
                onNavigate('tasks');
                setIsRibbonOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Tasks</span>
            </button>
            <button
              onClick={() => {
                onNavigate('finance');
                setIsRibbonOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
            >
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">Finance</span>
            </button>
            <button
              onClick={() => {
                onNavigate('sales');
                setIsRibbonOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Sales</span>
            </button>
            <button
              onClick={() => {
                onNavigate('bim');
                setIsRibbonOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
            >
              <Map className="w-4 h-4" />
              <span className="text-sm font-medium">BIM</span>
            </button>
          </div>

          {/* Support Section */}
          <div className="border-t border-white/20 px-3 py-4 space-y-1">
            <div className="text-xs font-medium text-white/60 uppercase tracking-wider px-3 py-2">
              Support
            </div>
            <button
              onClick={() => {
                onNavigate('settings');
                setIsRibbonOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Settings</span>
            </button>
            <button
              onClick={() => {
                onNavigate('support');
                setIsRibbonOpen(false);
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

    {/* Project Section - Full Screen */}
    {isProjectSectionOpen && (
      <div className="fixed inset-0 z-30 pt-16 pb-24">
        <div className="w-full h-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden">
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
              <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors duration-200">
                <h3 className="text-white font-semibold text-lg mb-3">Sample Project 1</h3>
                <p className="text-white/70 text-sm mb-4">Construction project in downtown area</p>
                <div className="flex items-center gap-3">
                  <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium">Active</span>
                  <span className="text-white/50 text-xs">Due: Dec 2024</span>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors duration-200">
                <h3 className="text-white font-semibold text-lg mb-3">Sample Project 2</h3>
                <p className="text-white/70 text-sm mb-4">Residential development phase 1</p>
                <div className="flex items-center gap-3">
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">Planning</span>
                  <span className="text-white/50 text-xs">Due: Jan 2025</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors duration-200">
                <h3 className="text-white font-semibold text-lg mb-3">Sample Project 3</h3>
                <p className="text-white/70 text-sm mb-4">Office building renovation</p>
                <div className="flex items-center gap-3">
                  <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-medium">In Progress</span>
                  <span className="text-white/50 text-xs">Due: Mar 2025</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors duration-200">
                <h3 className="text-white font-semibold text-lg mb-3">Sample Project 4</h3>
                <p className="text-white/70 text-sm mb-4">Bridge infrastructure upgrade</p>
                <div className="flex items-center gap-3">
                  <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-medium">Review</span>
                  <span className="text-white/50 text-xs">Due: Apr 2025</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors duration-200">
                <h3 className="text-white font-semibold text-lg mb-3">Sample Project 5</h3>
                <p className="text-white/70 text-sm mb-4">Retail complex development</p>
                <div className="flex items-center gap-3">
                  <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium">Active</span>
                  <span className="text-white/50 text-xs">Due: May 2025</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors duration-200">
                <h3 className="text-white font-semibold text-lg mb-3">Sample Project 6</h3>
                <p className="text-white/70 text-sm mb-4">Highway expansion project</p>
                <div className="flex items-center gap-3">
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">Planning</span>
                  <span className="text-white/50 text-xs">Due: Jun 2025</span>
                </div>
              </div>
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
    {isRibbonOpen && (
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