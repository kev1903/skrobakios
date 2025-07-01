
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { TaskChart } from "@/components/dashboard/TaskChart";
import { ProjectStatusChart } from "@/components/dashboard/ProjectStatusChart";
import { ProjectsList } from "@/components/dashboard/ProjectsList";
import { EarningsChart } from "@/components/dashboard/EarningsChart";

interface BusinessDashboardProps {
  onSelectProject: (projectId: string) => void;
  onNavigate: (page: string) => void;
}

export const BusinessDashboard = ({ onSelectProject, onNavigate }: BusinessDashboardProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="p-6 space-y-6">
        <DashboardHeader 
          selectedPeriod={selectedPeriod} 
          onPeriodChange={setSelectedPeriod}
          onNavigate={onNavigate}
        />

        <MetricsCards />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <TaskChart />
          <ProjectStatusChart />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ProjectsList onSelectProject={onSelectProject} onNavigate={onNavigate} />
          <EarningsChart />
        </div>
      </div>
    </div>
  );
};
