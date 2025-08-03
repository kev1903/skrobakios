import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ClipboardList, Calendar as CalendarIcon, Inbox, User, Save, Bell, LogIn, LogOut } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { NotificationBadge } from '@/components/ui/notification-badge';
import { NotificationDropdown } from '@/components/ui/notification-dropdown';
import { useUser } from '@/contexts/UserContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TopFloatingBarProps {
  onToggleRibbon: () => void;
  onNavigate: (page: string) => void;
  showSaveButton: boolean;
  onSaveMapPosition: () => Promise<void>;
}

export const TopFloatingBar = ({
  onToggleRibbon,
  onNavigate,
  showSaveButton,
  onSaveMapPosition
}: TopFloatingBarProps) => {
  const { userProfile } = useUser();
  const { unreadCount } = useNotifications();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error",
          description: "Failed to log out. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Successfully logged out",
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during logout",
        variant: "destructive",
      });
    }
  };

  return null; // Hidden to remove white banner
};