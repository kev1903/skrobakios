import React from 'react';
import { ArrowLeft, User, Clock, DollarSign, Heart, Users, Building2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserEditNavigationProps {
  firstName: string;
  lastName: string;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onNavigate: (page: string) => void;
  onSave: () => void;
  saving: boolean;
}

export const UserEditNavigation = ({ 
  firstName, 
  lastName, 
  activeSection, 
  onSectionChange, 
  onNavigate, 
  onSave, 
  saving 
}: UserEditNavigationProps) => {
  const profileNavItems = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'time', label: 'Time', icon: Clock },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'wellness', label: 'Wellness', icon: Heart },
    { id: 'family', label: 'Family', icon: Users },
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="fixed left-0 top-0 w-48 h-full bg-white/10 backdrop-blur-md border-r border-white/20 shadow-2xl z-40 transition-all duration-300">
      <div className="flex flex-col h-full pt-20">
        {/* Back Button */}
        <div className="flex-shrink-0 px-3 py-4 border-b border-white/20">
          <button
            onClick={() => onNavigate('home')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-white/30 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Close Page</span>
          </button>
        </div>

        {/* Profile Info */}
        <div className="flex-shrink-0 px-3 py-4 border-b border-white/20">
          <div className="text-white text-sm font-medium mb-2 truncate">
            {firstName} {lastName}
          </div>
          <div className="text-white/70 text-xs mb-2">Profile Settings</div>
        </div>

        {/* Profile Navigation Items */}
        <div className="flex-1 flex flex-col py-4 space-y-1 overflow-y-auto px-3">
          <div className="text-xs font-medium text-white/60 uppercase tracking-wider px-3 py-2 mb-1">
            Profile Navigation
          </div>
          {profileNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left ${
                activeSection === item.id 
                  ? 'bg-white/20 text-white border border-white/30' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Save Actions */}
        <div className="border-t border-white/20 px-3 py-4 space-y-2">
          <div className="text-xs font-medium text-white/60 uppercase tracking-wider px-3 py-2">
            Actions
          </div>
          <Button 
            onClick={onSave}
            disabled={saving}
            className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all duration-200"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};