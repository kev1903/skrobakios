import React, { useState } from 'react';
import { Search, User, Menu, Settings, HelpCircle, BarChart3, Briefcase, Calendar, DollarSign, TrendingUp, Map } from 'lucide-react';
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

        {/* Left side - Search Bar */}
        <div className="flex-shrink-0 max-w-xs">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4" />
            <Input type="text" placeholder="Search projects, tasks, files..." className="pl-10 pr-4 text-sm border-white/20 focus:border-white/40 focus:ring-white/30 bg-white/20 backdrop-blur-sm shadow-sm text-white placeholder-white/60 hover:bg-white/25 transition-all duration-200 py-0 px-[36px]" />
          </div>
        </div>

        {/* Center - Company Name */}
        <div className="flex-1 flex items-center justify-center">
          <h1 className="text-white font-bold text-xl tracking-wide">{userProfile.companyName || "Company Name"}</h1>
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
                onNavigate('dashboard');
                setIsRibbonOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
            <button
              onClick={() => {
                onNavigate('projects');
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

    {/* Overlay to close ribbon when clicking outside */}
    {isRibbonOpen && (
      <div 
        className="fixed inset-0 bg-black/20 z-30"
        onClick={() => setIsRibbonOpen(false)}
      />
    )}
  </>
  );
};