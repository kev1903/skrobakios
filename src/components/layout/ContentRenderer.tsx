import React from 'react';
import { TaskManagement } from "@/components/TaskManagement";
import { MyTasksPage } from "@/components/MyTasksPage";
import { Mapbox3DEnvironment } from "@/components/Mapbox3DEnvironment";
import { HomePage } from "@/components/HomePage";
import { ProjectDetail } from "@/components/ProjectDetail";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { ProjectFilePage } from "@/components/ProjectFilePage";
import { ProjectSettingsPage } from "@/components/ProjectSettingsPage";
import { ModernProjectSchedulePage } from "@/components/ModernProjectSchedulePage";
import { ProjectTasksPage } from "@/components/ProjectTasksPage";

import { GanttChartPage } from "@/components/GanttChartPage";
import { UploadProject } from "@/components/UploadProject";
import { AuthPage } from "@/components/auth/AuthPage";


import { SettingsPage } from "@/components/SettingsPage";
import { SupportPage } from "@/components/SupportPage";
import { CreateProject } from "@/components/CreateProject";
import { ProjectList } from "@/components/ProjectList";
import { FilePage } from "@/components/FilePage";
import { FinancePage } from "@/components/FinancePage";
import { FinanceSettingsPage } from "@/components/FinanceSettingsPage";
import { CashFlowPage } from "@/components/CashFlowPage";
import { InvoicesPage } from "@/components/InvoicesPage";
import { BillsPage } from "@/components/BillsPage";
import { RecurringPage } from "@/components/RecurringPage";
import { UserEditPage } from "@/components/UserEditPage";
import { UserProfilePage } from "@/components/user/UserProfilePage";
import { SalesPage } from "@/components/SalesPage";
import { WBSPage } from "@/components/WBSPage";
import { DigitalObjectsPage } from "@/components/DigitalObjectsPage";
import { TimeManagementPage } from "@/components/TimeManagementPage";
import { CostContractsPage } from "@/components/CostContractsPage";
import { AdminPage } from "@/components/admin/AdminPage";
import { CompanySettingsPage } from "@/components/company/CompanySettingsPage";
import { PlatformAuthPage } from "@/components/platform/PlatformAuthPage";
import { Project } from "@/hooks/useProjects";
interface ContentRendererProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onSelectProject: (projectId: string) => void;
  selectedProject: string | null;
  currentProject: Project | null;
}
export const ContentRenderer = ({
  currentPage,
  onNavigate,
  onSelectProject,
  selectedProject,
  currentProject
}: ContentRendererProps) => {
  const renderProjectNotFound = () => <div className="flex items-center justify-center h-full">
      <p className="text-slate-500">Project not found</p>
    </div>;
  switch (currentPage) {
    case "auth":
      return <AuthPage onNavigate={onNavigate} />;
    case "home":
      return <HomePage onNavigate={onNavigate} onSelectProject={onSelectProject} />;
    case "tasks":
      return <TaskManagement onNavigate={onNavigate} />;
    case "my-tasks":
      return <MyTasksPage onNavigate={onNavigate} />;
    case "time-management":
      return <TimeManagementPage onNavigate={onNavigate} />;
    case "settings":
      // Redirect to company settings instead of global settings
      onNavigate("company-settings");
      return <CompanySettingsPage onNavigate={onNavigate} />;
    case "admin":
      // Redirect admin to company settings page with admin tab
      onNavigate("company-settings");
      return <CompanySettingsPage onNavigate={onNavigate} />;
    case "create-project":
      return <CreateProject onNavigate={onNavigate} />;
    case "projects":
      return <ProjectList onNavigate={onNavigate} onSelectProject={onSelectProject} />;
    case "project-detail":
      return <ProjectDetail projectId={selectedProject} onNavigate={onNavigate} />;
    case "project-tasks":
      return currentProject ? <ProjectTasksPage project={currentProject} onNavigate={onNavigate} /> : renderProjectNotFound();
    case "project-files":
      return currentProject ? <ProjectFilePage project={currentProject} onNavigate={onNavigate} /> : renderProjectNotFound();
    case "project-settings":
      return currentProject ? <ProjectSettingsPage project={currentProject} onNavigate={onNavigate} /> : renderProjectNotFound();
    case "project-schedule":
      return currentProject ? <ModernProjectSchedulePage project={currentProject} onNavigate={onNavigate} /> : renderProjectNotFound();
    case "project-team":
      return currentProject ? <div className="p-8 text-center">Team management has been removed</div> : renderProjectNotFound();
    case "project-digital-twin":
      return currentProject ? <Mapbox3DEnvironment onNavigate={onNavigate} currentProject={currentProject} /> : renderProjectNotFound();
    case "project-wbs":
      return currentProject ? <WBSPage project={currentProject} onNavigate={onNavigate} /> : renderProjectNotFound();
    case "gantt-chart":
      return currentProject ? <GanttChartPage project={currentProject} onNavigate={onNavigate} /> : renderProjectNotFound();
    case "upload":
      return <UploadProject onNavigate={onNavigate} />;
    case "files":
      return <FilePage onNavigate={onNavigate} />;
    case "finance":
      return <FinancePage onNavigate={onNavigate} />;
    case "finance-settings":
      return <FinanceSettingsPage onNavigate={onNavigate} />;
    case "cashflow":
      return <CashFlowPage onNavigate={onNavigate} />;
    case "invoices":
      return <InvoicesPage onNavigate={onNavigate} />;
    case "bills":
      return <BillsPage onNavigate={onNavigate} />;
    case "recurring":
      return <RecurringPage onNavigate={onNavigate} />;
    case "sales":
      return <SalesPage onNavigate={onNavigate} />;
    case "cost-contracts":
      return <CostContractsPage onNavigate={onNavigate} />;
    case "project-cost":
      return currentProject ? <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
          <ProjectSidebar project={currentProject} onNavigate={onNavigate} getStatusColor={(status: string) => {
          switch (status) {
            case "completed":
              return "bg-green-500/20 text-green-300 border-green-500/30";
            case "running":
              return "bg-orange-500/20 text-orange-300 border-orange-500/30";
            case "pending":
              return "bg-red-500/20 text-red-300 border-red-500/30";
            default:
              return "bg-gray-500/20 text-gray-300 border-gray-500/30";
          }
        }} getStatusText={(status: string) => {
          switch (status) {
            case "completed":
              return "Completed";
            case "running":
              return "In Progress";
            case "pending":
              return "Pending";
            default:
              return "Active";
          }
        }} activeSection="cost" />
          <div className="flex-1 overflow-auto ml-48 backdrop-blur-xl bg-white/5 border-l border-white/10">
            <CostContractsPage onNavigate={onNavigate} />
          </div>
        </div> : renderProjectNotFound();
    case "bim":
      return currentProject ? <DigitalObjectsPage project={currentProject} onNavigate={onNavigate} /> : renderProjectNotFound();
    case "3d-environment":
      return <Mapbox3DEnvironment onNavigate={onNavigate} currentProject={null} />;
    case "support":
      return <SupportPage />;
    case "user-edit":
      return <UserEditPage onNavigate={onNavigate} />;
    case "user-profile":
      return <UserProfilePage onNavigate={onNavigate} />;
    case "company-settings":
      return <CompanySettingsPage onNavigate={onNavigate} />;
    case "platform":
      return <PlatformAuthPage onNavigate={onNavigate} />;
    case "inbox":
    case "asset":
    case "schedules":
      // Redirect incomplete pages to home
      onNavigate("home");
      return <HomePage onNavigate={onNavigate} onSelectProject={onSelectProject} />;
    default:
      return <AuthPage onNavigate={onNavigate} />;
  }
};