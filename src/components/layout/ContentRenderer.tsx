
import React from 'react';
import { TaskManagement } from "@/components/TaskManagement";
import { Mapbox3DEnvironment } from "@/components/Mapbox3DEnvironment";
import { HomePage } from "@/components/HomePage";
import { ProjectDetail } from "@/components/ProjectDetail";
import { ProjectFilePage } from "@/components/ProjectFilePage";
import { ProjectSettingsPage } from "@/components/ProjectSettingsPage";
import { ProjectSchedulePage } from "@/components/ProjectSchedulePage";
import { ProjectTasksPage } from "@/components/ProjectTasksPage";
import { ProjectTeamPage } from "@/components/ProjectTeamPage";
import { GanttChartPage } from "@/components/GanttChartPage";
import { UploadProject } from "@/components/UploadProject";
import { AuthPage } from "@/components/auth/AuthPage";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { NewUserPage } from "@/components/admin/NewUserPage";
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
import { SalesPage } from "@/components/SalesPage";
import { WBSPage } from "@/components/WBSPage";
import { ProjectDigitalTwinPage } from "@/components/ProjectDigitalTwinPage";

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
  const renderProjectNotFound = () => (
    <div className="flex items-center justify-center h-full">
      <p className="text-slate-500">Project not found</p>
    </div>
  );

  switch (currentPage) {
    case "auth":
      return <AuthPage onNavigate={onNavigate} />;
    case "home":
      return <HomePage onNavigate={onNavigate} onSelectProject={onSelectProject} />;
    case "tasks":
      return <TaskManagement onNavigate={onNavigate} />;
    case "settings":
      return <SettingsPage onNavigate={onNavigate} />;
    case "admin":
      return <AdminPanel onNavigate={onNavigate} />;
    case "admin-new-user":
      return <NewUserPage onNavigate={onNavigate} />;
    case "create-project":
      return <CreateProject onNavigate={onNavigate} />;
    case "projects":
      return <ProjectList onNavigate={onNavigate} onSelectProject={onSelectProject} />;
    case "project-detail":
      return <ProjectDetail projectId={selectedProject} onNavigate={onNavigate} />;
    case "project-digital-twin":
      return currentProject ? (
        <ProjectDigitalTwinPage project={currentProject} onNavigate={onNavigate} />
      ) : renderProjectNotFound();
    case "project-tasks":
      return currentProject ? (
        <ProjectTasksPage project={currentProject} onNavigate={onNavigate} />
      ) : renderProjectNotFound();
    case "project-files":
      return currentProject ? (
        <ProjectFilePage project={currentProject} onNavigate={onNavigate} />
      ) : renderProjectNotFound();
    case "project-settings":
      return currentProject ? (
        <ProjectSettingsPage project={currentProject} onNavigate={onNavigate} />
      ) : renderProjectNotFound();
    case "project-schedule":
      return currentProject ? (
        <ProjectSchedulePage project={currentProject} onNavigate={onNavigate} />
      ) : renderProjectNotFound();
    case "project-team":
      return currentProject ? (
        <ProjectTeamPage project={currentProject} onNavigate={onNavigate} />
      ) : renderProjectNotFound();
    case "project-wbs":
      return currentProject ? (
        <WBSPage project={currentProject} onNavigate={onNavigate} />
      ) : renderProjectNotFound();
    case "gantt-chart":
      return currentProject ? (
        <GanttChartPage project={currentProject} onNavigate={onNavigate} />
      ) : renderProjectNotFound();
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
    case "bim":
      return <Mapbox3DEnvironment onNavigate={onNavigate} />;
    case "support":
      return <SupportPage />;
    case "user-edit":
      return <UserEditPage onNavigate={onNavigate} />;
    default:
      return <AuthPage onNavigate={onNavigate} />;
  }
};
