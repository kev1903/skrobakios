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
    <div className="bg-gradient-to-br from-[#F5F1E3] to-[#FEFCF5] border-b border-[#E8E3D3] p-6 shadow-sm w-full">
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900 font-manrope">{getCompanyName()}</h1>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="flex items-center bg-gray-800 rounded-full p-1">
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
                      ? "bg-gray-800 text-white" 
                      : "text-gray-600 hover:text-gray-800"
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
              className="rounded-full"
            >
              <CheckSquare className="w-5 h-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => onNavigate("settings")}
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
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