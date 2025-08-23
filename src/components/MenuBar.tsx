import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, X, Menu, ClipboardList, Calendar as CalendarIcon, Inbox, User, Save, Bell, LogIn, LogOut, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { NotificationBadge } from '@/components/ui/notification-badge';
import { NotificationDropdown } from '@/components/ui/notification-dropdown';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useAppContext } from '@/contexts/AppContextProvider';
import { useGlobalSidebar } from '@/contexts/GlobalSidebarContext';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AiChatSidebar } from '@/components/AiChatSidebar';
import { VoiceSphere } from '@/components/VoiceSphere';
import { VoiceInterface } from '@/components/VoiceInterface';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export const MenuBar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile } = useUser();
  const { unreadCount } = useNotifications();
  const { isAuthenticated, signOut } = useAuth();
  const { currentCompany } = useCompany();
  const { activeContext, setActiveContext } = useAppContext();
  const { toggleSidebar } = useGlobalSidebar();
  const barRef = useRef<HTMLDivElement>(null);
  
  // Initialize voice chat functionality
  const {
    state: voiceState,
    settings: voiceSettings,
    initializeVoiceChat,
    startPushToTalk,
    stopPushToTalk,
    disconnect: disconnectVoice
  } = useVoiceChat();
  
  // Header icons state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(); // This will redirect to landing page automatically
      toast({
        title: "Success",
        description: "Successfully logged out",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during logout",
        variant: "destructive",
      });
    }
  };

  const handleVoiceToggle = async () => {
    try {
      if (voiceState.isListening) {
        // Stop listening
        stopPushToTalk();
        disconnectVoice();
      } else {
        // Initialize and start listening
        await initializeVoiceChat('push-to-talk');
        startPushToTalk();
      }
    } catch (error) {
      console.error('Voice toggle error:', error);
      toast({
        title: "Voice Error",
        description: "Failed to start voice interface. Please check microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const handleVoiceMessage = (message: string) => {
    // Voice message received - could be forwarded to AI chat if needed
    console.log('Voice message received:', message);
  };

  const handleVoiceEnd = () => {
    setShowAiChat(false);
    setIsVoiceSpeaking(false);
  };

  // Get display text for company logo - using same logic as CenteredCompanyName
  const getCompanyDisplayText = () => {
    if (activeContext === 'personal') {
      // Show user's full name for personal context
      if (userProfile.firstName || userProfile.lastName) {
        return `${userProfile.firstName} ${userProfile.lastName}`.trim();
      }
      // Fallback to email for personal context
      return userProfile.email || "Personal";
    } else {
      // Show business name for company context
      // Check if company name looks like an auto-generated default
      const isDefaultCompanyName = currentCompany?.name && (
        currentCompany.name.includes('@') || 
        currentCompany.name.endsWith('\'s Business') ||
        currentCompany.name.endsWith('\'s Company')
      );
      
      // If we have a real company name (not auto-generated), show it
      if (currentCompany?.name && !isDefaultCompanyName) {
        return currentCompany.name;
      }
      
      // Fallback to user's name or default for company context
      if (userProfile.firstName || userProfile.lastName) {
        return `${userProfile.firstName} ${userProfile.lastName}`.trim();
      }
      
      return userProfile.email || "SKROBAKI";
    }
  };

  // Keep --header-height in sync with actual bar height to prevent gaps
  React.useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const setVar = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--header-height', `${h}px`);
    };
    setVar();
    const ro = new ResizeObserver(() => setVar());
    ro.observe(el);
    window.addEventListener('resize', setVar);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', setVar);
    };
  }, []);

  return (
    <>
      <div ref={barRef} className="fixed top-0 left-0 right-0 z-[11000] backdrop-blur-xl bg-background/80 border-b border-border shadow-lg">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left side - Menu and Company Logo */}
          <div className="flex items-center space-x-4">
            {/* Hamburger Menu Icon */}
            <button 
              onClick={toggleSidebar}
              className="w-8 h-8 bg-muted/50 backdrop-blur-sm rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors duration-200 text-foreground"
              aria-label="Toggle main navigation sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            
            {/* Company Logo */}
            <div className="flex items-center space-x-2">
            <div 
                className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity duration-200"
                onClick={() => {
                  if (activeContext === 'company') {
                    // Navigate to business homepage with map
                    navigate('/?page=home');
                  } else {
                    // Navigate to personal profile with map
                    navigate('/?page=profile');
                  }
                }}
              >
                <span className="text-primary-foreground font-bold text-xs">
                  {getCompanyDisplayText().charAt(0).toUpperCase()}
                </span>
              </div>
              <h1 
                className="text-sm font-bold text-foreground hidden sm:block cursor-pointer hover:text-primary transition-colors"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event bubbling
                  if (activeContext === 'company') {
                    // Navigate to business homepage with map
                    navigate('/?page=home');
                  } else {
                    // Navigate to personal profile with map
                    navigate('/?page=profile');
                  }
                }}
              >
                {getCompanyDisplayText()}
              </h1>
            </div>
          </div>

          {/* Center - AI Voice Sphere */}
          <div className="flex items-center space-x-4">
            <VoiceSphere
              isActive={voiceState.isConnected || voiceState.isListening}
              isSpeaking={voiceState.isSpeaking}
              isListening={voiceState.isListening}
              audioLevel={voiceState.audioLevel}
              onClick={handleVoiceToggle}
              className="w-10 h-10"
            />
          </div>

          {/* Right side - Navigation icons and actions */}
          <div className="flex items-center space-x-3">
            {/* Navigation Icons */}
            {isAuthenticated ? (
              <>
                {/* Tasks Icon */}
                <Link 
                  to="/tasks"
                  className="w-8 h-8 bg-muted/50 backdrop-blur-sm rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors duration-200 text-foreground"
                >
                  <ClipboardList className="w-4 h-4" />
                </Link>
                
                {/* Notifications */}
                <NotificationDropdown>
                  <NotificationBadge count={unreadCount}>
                    <button className="w-8 h-8 bg-muted/50 backdrop-blur-sm rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors duration-200 text-foreground">
                      <Bell className="w-4 h-4" />
                    </button>
                  </NotificationBadge>
                </NotificationDropdown>
                
                {/* Inbox Icon */}
                <button 
                  onClick={() => navigate('/?page=inbox')} 
                  className="w-8 h-8 bg-muted/50 backdrop-blur-sm rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors duration-200 text-foreground"
                >
                  <Inbox className="w-4 h-4" />
                </button>
                
                {/* AI Chat Icon */}
                <button 
                  onClick={() => setShowAiChat(true)} 
                  className="w-8 h-8 bg-muted/50 backdrop-blur-sm rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors duration-200 text-foreground"
                  title="Open AI Assistant"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                
                {/* User Profile */}
                <div className="relative" ref={profileDropdownRef}>
                  <div 
                    className="flex items-center gap-2 px-2 py-1 bg-muted/50 backdrop-blur-sm rounded-full border border-border cursor-pointer hover:bg-muted transition-colors duration-200"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage 
                        src={userProfile.avatarUrl || undefined} 
                        alt={`${userProfile?.firstName || 'User'} ${userProfile?.lastName || ''}`.trim()}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <AvatarFallback className="bg-muted text-foreground text-xs">
                        {userProfile?.firstName && userProfile?.lastName 
                          ? `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase()
                          : userProfile?.firstName?.charAt(0)?.toUpperCase() || userProfile?.email?.charAt(0)?.toUpperCase() || 'U'
                        }
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground max-w-24 truncate">
                      {userProfile?.firstName && userProfile?.lastName 
                        ? `${userProfile.firstName} ${userProfile.lastName}`.trim()
                        : userProfile?.firstName || userProfile?.email?.split('@')[0] || 'User'
                      }
                    </span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </div>
                  
                  {/* Profile Dropdown */}
                  {showProfileDropdown && (
                    <div 
                      className="absolute right-0 top-full mt-2 w-48 bg-card/95 backdrop-blur-sm rounded-lg border border-border shadow-lg z-40"
                    >
                      <div className="p-3 border-b border-border">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage 
                              src={userProfile.avatarUrl || undefined} 
                              alt={`${userProfile?.firstName || 'User'} ${userProfile?.lastName || ''}`.trim()}
                            />
                            <AvatarFallback className="bg-primary/20 text-primary text-xs">
                              {userProfile?.firstName && userProfile?.lastName 
                                ? `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase()
                                : userProfile?.firstName?.charAt(0)?.toUpperCase() || userProfile?.email?.charAt(0)?.toUpperCase() || 'U'
                              }
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {userProfile?.firstName && userProfile?.lastName 
                                ? `${userProfile.firstName} ${userProfile.lastName}`
                                : userProfile?.email || 'User'
                              }
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {userProfile?.email || ''}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-2">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-foreground hover:bg-background/20 transition-colors duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Sign In Button for unauthenticated users */
              <button 
                onClick={() => window.location.href = '/?page=auth'} 
                className="flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-sm rounded-lg border border-primary/30 text-primary hover:bg-primary/30 transition-colors duration-200"
              >
                <LogIn className="w-4 h-4" />
                <span className="text-sm font-medium">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* AI Chat Modal */}
      <Dialog open={showAiChat} onOpenChange={setShowAiChat}>
        <DialogContent className="max-w-2xl h-[80vh] p-0 overflow-hidden">
          <DialogTitle className="sr-only">AI Assistant</DialogTitle>
          <AiChatSidebar 
            isCollapsed={false} 
            onToggleCollapse={() => {}}
            onNavigate={() => {}}
            fullScreen={true}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
