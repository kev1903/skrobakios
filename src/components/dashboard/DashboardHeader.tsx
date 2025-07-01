
import { Calendar, Eye, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  onNavigate: (page: string) => void;
}

export const DashboardHeader = ({ selectedPeriod, onPeriodChange, onNavigate }: DashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F59E0B] to-[#D97706] bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 text-sm mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <Badge className="bg-[#F59E0B] text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
          <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
          Live
        </Badge>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center space-x-3">
        {/* Period Selector */}
        <Button
          variant="outline"
          className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white shadow-lg"
        >
          <Calendar className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-gray-700">{selectedPeriod}</span>
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl border border-gray-200"
        >
          <Bell className="w-4 h-4 text-gray-600" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">3</span>
          </div>
        </Button>

        {/* Settings */}
        <Button
          variant="ghost"
          className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl border border-gray-200"
        >
          <Settings className="w-4 h-4 text-gray-600" />
        </Button>
        
        {/* 3D View Button */}
        <Button
          className="flex items-center space-x-2 bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#F59E0B] text-white shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={() => onNavigate("gantt-chart")}
        >
          <Eye className="w-4 h-4" />
          <span>3D View</span>
        </Button>

        {/* User Avatar */}
        <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200">
          <Avatar className="w-8 h-8 ring-2 ring-[#FEF3C7]">
            <AvatarImage src="/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png" />
            <AvatarFallback className="bg-[#F59E0B] text-white text-sm">
              LP
            </AvatarFallback>
          </Avatar>
          <div className="pr-2">
            <p className="text-sm font-medium text-gray-900">Lora Peterson</p>
            <p className="text-xs text-gray-500">Project Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
};
