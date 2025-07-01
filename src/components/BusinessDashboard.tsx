
import { useState } from "react";
import { Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="h-full overflow-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="p-8">
        <DashboardHeader 
          selectedPeriod={selectedPeriod} 
          onPeriodChange={setSelectedPeriod}
          onNavigate={onNavigate}
        />

        <MetricsCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TaskChart />
          <ProjectStatusChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProjectsList onSelectProject={onSelectProject} onNavigate={onNavigate} />
          <EarningsChart />
        </div>
      </div>
    </div>
  );
};
