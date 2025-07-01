
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WorkspaceStats } from "@/components/dashboard/WorkspaceStats";
import { NewLeadsSection } from "@/components/dashboard/NewLeadsSection";
import { TasksSection } from "@/components/dashboard/TasksSection";
import { SummarySection } from "@/components/dashboard/SummarySection";

interface BusinessDashboardProps {
  onSelectProject: (projectId: string) => void;
  onNavigate: (page: string) => void;
}

export const BusinessDashboard = ({ onSelectProject, onNavigate }: BusinessDashboardProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <DashboardHeader 
          selectedPeriod={selectedPeriod} 
          onPeriodChange={setSelectedPeriod}
          onNavigate={onNavigate}
        />

        <div className="space-y-6">
          {/* Workspace Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">WORKSPACE</h2>
            <button className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium">
              Your Task
            </button>
          </div>

          <WorkspaceStats />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <NewLeadsSection onNavigate={onNavigate} />
              <TasksSection />
            </div>
            
            <div className="space-y-6">
              <SummarySection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
