
import { Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  onNavigate: (page: string) => void;
}

export const DashboardHeader = ({ selectedPeriod, onPeriodChange, onNavigate }: DashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
          <span className="w-2 h-2 bg-white rounded-full"></span>
          <span>K</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm"
        >
          <Calendar className="w-4 h-4" />
          <span>{selectedPeriod}</span>
        </Button>
        
        <Button
          className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white"
          onClick={() => onNavigate("gantt-chart")}
        >
          <Eye className="w-4 h-4" />
          <span>3D View</span>
        </Button>
      </div>
    </div>
  );
};
