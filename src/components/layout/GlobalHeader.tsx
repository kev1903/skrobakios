import React from 'react';
import { Bell, Settings, User, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";

interface GlobalHeaderProps {
  onNavigate: (page: string) => void;
  currentPage?: string;
}

export const GlobalHeader = ({ onNavigate, currentPage }: GlobalHeaderProps) => {
  const { profile } = useProfile();
  
  const getCompanyName = () => {
    return profile?.company || "Company name";
  };

  const navigationItems = [
    { label: "Dashboard", active: currentPage === "dashboard" || currentPage === "" },
    { label: "Files", active: currentPage === "files" },
    { label: "Projects", active: currentPage === "projects" },
    { label: "Finances", active: currentPage === "finance" },
    { label: "Sales", active: currentPage === "sales" },
    { label: "Calendar", active: currentPage === "calendar" },
  ];

  return (
    <div className="glass-light border-b border-white/20 p-6 shadow-lg w-full">
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-amber-600 bg-clip-text text-transparent font-manrope heading-modern">{getCompanyName()}</h1>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="flex items-center bg-slate-800/80 backdrop-blur-sm rounded-full p-1 shadow-lg">
              {navigationItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (item.label === "Dashboard") {
                      onNavigate("dashboard");
                    } else if (item.label === "Projects") {
                      onNavigate("projects");
                    } else if (item.label === "Files") {
                      onNavigate("files");
                    } else if (item.label === "Finances") {
                      onNavigate("finance");
                    } else if (item.label === "Sales") {
                      onNavigate("sales");
                    } else if (item.label === "Calendar") {
                      onNavigate("calendar");
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    item.active 
                      ? "bg-amber-500 text-white shadow-lg" 
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-white/20"
            >
              <CheckSquare className="w-5 h-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-white/20"
              onClick={() => onNavigate("settings")}
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/20">
              <Bell className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-white/20"
              onClick={() => onNavigate("user-edit")}
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};