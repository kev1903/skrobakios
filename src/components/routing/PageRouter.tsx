
import { TaskManagement } from "@/components/TaskManagement";
import { BusinessDashboard } from "@/components/BusinessDashboard";
import { AuthPage } from "@/components/auth/AuthPage";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { SettingsPage } from "@/components/SettingsPage";
import { SupportPage } from "@/components/SupportPage";
import { CreateProject } from "@/components/CreateProject";
import { ProjectList } from "@/components/ProjectList";
import { UploadProject } from "@/components/UploadProject";
import { FilePage } from "@/components/FilePage";
import { FinancePage } from "@/components/FinancePage";
import { FinanceSettingsPage } from "@/components/FinanceSettingsPage";
import { CashFlowPage } from "@/components/CashFlowPage";
import { InvoicesPage } from "@/components/InvoicesPage";
import { BillsPage } from "@/components/BillsPage";
import { RecurringPage } from "@/components/RecurringPage";
import { UserEditPage } from "@/components/UserEditPage";
import { ProjectRouter } from "./ProjectRouter";

interface PageRouterProps {
  currentPage: string;
  selectedProject: string | null;
  getCurrentProject: () => any;
  onNavigate: (page: string) => void;
  onSelectProject: (projectId: string) => void;
}

export const PageRouter = ({ 
  currentPage, 
  selectedProject, 
  getCurrentProject, 
  onNavigate, 
  onSelectProject 
}: PageRouterProps) => {
  // Project-specific pages
  const projectPages = [
    "project-detail", "project-tasks", "project-files", "project-settings", 
    "project-schedule", "project-team", "project-bim", "gantt-chart"
  ];

  if (projectPages.includes(currentPage)) {
    return (
      <ProjectRouter
        currentPage={currentPage}
        selectedProject={selectedProject}
        getCurrentProject={getCurrentProject}
        onNavigate={onNavigate}
      />
    );
  }

  // Main application pages
  const pageRoutes: Record<string, JSX.Element> = {
    "auth": <AuthPage onNavigate={onNavigate} />,
    "tasks": <TaskManagement onNavigate={onNavigate} />,
    "dashboard": <BusinessDashboard onSelectProject={onSelectProject} onNavigate={onNavigate} />,
    "settings": <SettingsPage onNavigate={onNavigate} />,
    "admin": <AdminPanel onNavigate={onNavigate} />,
    "create-project": <CreateProject onNavigate={onNavigate} />,
    "projects": <ProjectList onNavigate={onNavigate} onSelectProject={onSelectProject} />,
    "upload": <UploadProject onNavigate={onNavigate} />,
    "files": <FilePage onNavigate={onNavigate} />,
    "finance": <FinancePage onNavigate={onNavigate} />,
    "finance-settings": <FinanceSettingsPage onNavigate={onNavigate} />,
    "cashflow": <CashFlowPage onNavigate={onNavigate} />,
    "invoices": <InvoicesPage onNavigate={onNavigate} />,
    "bills": <BillsPage onNavigate={onNavigate} />,
    "recurring": <RecurringPage onNavigate={onNavigate} />,
    "support": <SupportPage />,
    "user-edit": <UserEditPage onNavigate={onNavigate} />
  };

  return pageRoutes[currentPage] || <AuthPage onNavigate={onNavigate} />;
};
