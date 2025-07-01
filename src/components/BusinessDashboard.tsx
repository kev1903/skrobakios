
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UserWelcomePanel } from "@/components/dashboard/UserWelcomePanel";
import { TimeTracker } from "@/components/dashboard/TimeTracker";
import { WorkspaceStats } from "@/components/dashboard/WorkspaceStats";
import { NewLeadsSection } from "@/components/dashboard/NewLeadsSection";
import { TasksSection } from "@/components/dashboard/TasksSection";
import { SummarySection } from "@/components/dashboard/SummarySection";
import { CalendarPreview } from "@/components/dashboard/CalendarPreview";

interface BusinessDashboardProps {
  onSelectProject: (projectId: string) => void;
  onNavigate: (page: string) => void;
}

export const BusinessDashboard = ({ onSelectProject, onNavigate }: BusinessDashboardProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F9FF] to-[#E9F0FA]">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <DashboardHeader 
          selectedPeriod={selectedPeriod} 
          onPeriodChange={setSelectedPeriod}
          onNavigate={onNavigate}
        />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - User Panel & Time Tracker */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <UserWelcomePanel />
            <TimeTracker />
          </div>

          {/* Middle Column - Main Content */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            {/* Workspace Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">WORKSPACE</h2>
                <button className="bg-[#3366FF] hover:bg-[#1F3D7A] text-white px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                  Your Task
                </button>
              </div>
              <WorkspaceStats />
            </div>

            <NewLeadsSection onNavigate={onNavigate} />
            <TasksSection />
          </div>

          {/* Right Column - Calendar & Summary */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <CalendarPreview />
            <SummarySection />
          </div>
        </div>
      </div>
    </div>
  );
};
