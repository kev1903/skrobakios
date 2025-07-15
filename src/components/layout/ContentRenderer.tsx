import React from 'react';
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
import { PlatformSignupPage } from "@/components/auth/PlatformSignupPage";
import { LandingPage } from "@/components/LandingPage";
// UserProfile import removed
import { ModuleProtectedRoute } from "@/components/auth/ModuleProtectedRoute";

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
// Profile-related imports removed
import { SalesPage } from "@/components/SalesPage";
import { WBSPage } from "@/components/WBSPage";
import { DigitalObjectsPage } from "@/components/DigitalObjectsPage";
import { TimeManagementPage } from "@/components/TimeManagementPage";
import { CostContractsPage } from "@/components/CostContractsPage";
import { AdminPage } from "@/components/admin/AdminPage";
import { CompanySettingsPage } from "@/components/company/CompanySettingsPage";
import { PlatformAuthPage } from "@/components/platform/PlatformAuthPage";
import { PlatformDashboard } from "@/components/platform/PlatformDashboard";
import { ModernPlatformDashboard } from "@/components/platform/ModernPlatformDashboard";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import { usePlatformAuth } from "@/contexts/PlatformAuthContext";
import { ProjectDashboard } from "@/components/projects/ProjectDashboard";
import { TaskManagement } from "@/components/projects/TaskManagement";
import { Project } from "@/hooks/useProjects";
import { BusinessManagementPage } from "@/components/BusinessManagementPage";
import { CreateBusinessPage } from "@/components/CreateBusinessPage";
import { PortfolioManagePage } from "@/components/portfolio/PortfolioManagePage";
import { PortfolioViewPage } from "@/components/portfolio/PortfolioViewPage";
import { ReviewsPage } from "@/components/review/ReviewsPage";
import { ProjectTeamRedirect } from "@/components/projects/ProjectTeamRedirect";
import { MilestonePage } from "@/components/MilestonePage";
import { BusinessInvitationManager } from "@/components/invitations/BusinessInvitationManager";
import { PermissionManager } from "@/components/permissions/PermissionManager";
import { InvitationAcceptancePage } from "@/components/invitations/InvitationAcceptancePage";
import { PersonalPage } from "@/components/PersonalPage";
import { TimePage } from "@/components/TimePage";
import { WellnessPage } from "@/components/WellnessPage";
import { FamilyPage } from "@/components/FamilyPage";
import { SecurityPage } from "@/components/SecurityPage";
import { PlatformUserManagement } from "@/components/platform/PlatformUserManagement";

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
  const { isPlatformAuthenticated } = usePlatformAuth();
  const renderProjectNotFound = () => <div className="flex items-center justify-center h-full">
      <p className="text-slate-500">Project not found</p>
    </div>;
  switch (currentPage) {
    case "landing":
      return <LandingPage onNavigate={onNavigate} />;
    case "auth":
      return <AuthPage onNavigate={onNavigate} />;
    case "platform-signup":
      return <PlatformSignupPage onNavigate={onNavigate} />;
    case "home":
      return <HomePage onNavigate={onNavigate} onSelectProject={onSelectProject} currentPage={currentPage} />;
    case "tasks":
      return <TaskManagement onNavigate={onNavigate} />;
    case "my-tasks":
      return <MyTasksPage onNavigate={onNavigate} />;
    case "milestones":
      return <MilestonePage onNavigate={onNavigate} />;
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
      return (
        <ModuleProtectedRoute requiredModule="projects" onNavigate={onNavigate}>
          <CreateProject onNavigate={onNavigate} />
        </ModuleProtectedRoute>
      );
    case "projects":
      return (
        <ModuleProtectedRoute requiredModule="projects" onNavigate={onNavigate}>
          <ProjectList onNavigate={onNavigate} onSelectProject={onSelectProject} />
        </ModuleProtectedRoute>
      );
    case "project-detail":
      return (
        <ModuleProtectedRoute requiredModule="projects" onNavigate={onNavigate}>
          <ProjectDetail projectId={selectedProject} onNavigate={onNavigate} />
        </ModuleProtectedRoute>
      );
    case "project-tasks":
      return currentProject ? (
        <ModuleProtectedRoute requiredModule="tasks" onNavigate={onNavigate}>
          <ProjectTasksPage project={currentProject} onNavigate={onNavigate} />
        </ModuleProtectedRoute>
      ) : renderProjectNotFound();
    case "project-files":
      return currentProject ? (
        <ModuleProtectedRoute requiredModule="files" onNavigate={onNavigate}>
          <ProjectFilePage project={currentProject} onNavigate={onNavigate} />
        </ModuleProtectedRoute>
      ) : renderProjectNotFound();
    case "project-settings":
      return currentProject ? (
        <ModuleProtectedRoute requiredModule="projects" onNavigate={onNavigate}>
          <ProjectSettingsPage project={currentProject} onNavigate={onNavigate} />
        </ModuleProtectedRoute>
      ) : renderProjectNotFound();
    case "project-schedule":
      return currentProject ? (
        <ModuleProtectedRoute requiredModule="schedule" onNavigate={onNavigate}>
          <ModernProjectSchedulePage project={currentProject} onNavigate={onNavigate} />
        </ModuleProtectedRoute>
      ) : renderProjectNotFound();
    case "project-team":
      return currentProject ? (
        <ModuleProtectedRoute requiredModule="team" onNavigate={onNavigate}>
          <ProjectTeamRedirect projectId={currentProject.id} />
        </ModuleProtectedRoute>
      ) : renderProjectNotFound();
    case "project-digital-twin":
      return currentProject ? (
        <ModuleProtectedRoute requiredModule="digital-twin" onNavigate={onNavigate}>
          <Mapbox3DEnvironment onNavigate={onNavigate} currentProject={currentProject} />
        </ModuleProtectedRoute>
      ) : renderProjectNotFound();
    case "project-wbs":
      return currentProject ? (
        <ModuleProtectedRoute requiredModule="projects" onNavigate={onNavigate}>
          <WBSPage project={currentProject} onNavigate={onNavigate} />
        </ModuleProtectedRoute>
      ) : renderProjectNotFound();
    case "gantt-chart":
      return currentProject ? (
        <ModuleProtectedRoute requiredModule="schedule" onNavigate={onNavigate}>
          <GanttChartPage project={currentProject} onNavigate={onNavigate} />
        </ModuleProtectedRoute>
      ) : renderProjectNotFound();
    case "upload":
      return (
        <ModuleProtectedRoute requiredModule="projects" onNavigate={onNavigate}>
          <UploadProject onNavigate={onNavigate} />
        </ModuleProtectedRoute>
      );
    case "files":
      return (
        <ModuleProtectedRoute requiredModule="files" onNavigate={onNavigate}>
          <FilePage onNavigate={onNavigate} />
        </ModuleProtectedRoute>
      );
    case "finance":
      return (
        <ModuleProtectedRoute requiredModule="finance" onNavigate={onNavigate}>
          <FinancePage onNavigate={onNavigate} />
        </ModuleProtectedRoute>
      );
    case "finance-settings":
      return (
        <ModuleProtectedRoute requiredModule="finance" onNavigate={onNavigate}>
          <FinanceSettingsPage onNavigate={onNavigate} />
        </ModuleProtectedRoute>
      );
    case "cashflow":
      return (
        <ModuleProtectedRoute requiredModule="finance" onNavigate={onNavigate}>
          <CashFlowPage onNavigate={onNavigate} />
        </ModuleProtectedRoute>
      );
    case "invoices":
      return (
        <ModuleProtectedRoute requiredModule="finance" onNavigate={onNavigate}>
          <InvoicesPage onNavigate={onNavigate} />
        </ModuleProtectedRoute>
      );
    case "bills":
      return (
        <ModuleProtectedRoute requiredModule="finance" onNavigate={onNavigate}>
          <BillsPage onNavigate={onNavigate} />
        </ModuleProtectedRoute>
      );
    case "recurring":
      return (
        <ModuleProtectedRoute requiredModule="finance" onNavigate={onNavigate}>
          <RecurringPage onNavigate={onNavigate} />
        </ModuleProtectedRoute>
      );
    case "sales":
      return (
        <ModuleProtectedRoute requiredModule="sales" onNavigate={onNavigate}>
          <SalesPage onNavigate={onNavigate} />
        </ModuleProtectedRoute>
      );
    case "cost-contracts":
      return (
        <ModuleProtectedRoute requiredModule="cost-contracts" onNavigate={onNavigate}>
          <CostContractsPage onNavigate={onNavigate} />
        </ModuleProtectedRoute>
      );
    case "business-invitations":
      return <BusinessInvitationManager onNavigate={onNavigate} />;
    case "team-management":
      return <PermissionManager onNavigate={onNavigate} />;
    case "invitation-acceptance":
      return <InvitationAcceptancePage onNavigate={onNavigate} />;
    case "project-cost":
      return currentProject ? (
        <ModuleProtectedRoute requiredModule="cost-contracts" onNavigate={onNavigate}>
          <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
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
          </div>
        </ModuleProtectedRoute>
      ) : renderProjectNotFound();
    case "bim":
      return currentProject ? (
        <ModuleProtectedRoute requiredModule="digital-objects" onNavigate={onNavigate}>
          <DigitalObjectsPage project={currentProject} onNavigate={onNavigate} />
        </ModuleProtectedRoute>
      ) : renderProjectNotFound();
    case "3d-environment":
      return <Mapbox3DEnvironment onNavigate={onNavigate} currentProject={null} />;
    case "support":
      return <SupportPage />;
    case "subscription":
      window.location.href = "/subscription";
      return null;
    case "user-edit":
    case "existing-user-profile":
      // Profile pages removed - redirect to home
      onNavigate("home");
      return <HomePage onNavigate={onNavigate} onSelectProject={onSelectProject} currentPage={currentPage} />;
    case "company-settings":
      return <CompanySettingsPage onNavigate={onNavigate} />;
    case "business":
    case "business-management":
      return <BusinessManagementPage onNavigate={onNavigate} />;
    case "create-business":
      return <CreateBusinessPage onNavigate={onNavigate} />;
    case "platform":
      return <PlatformAuthPage onNavigate={onNavigate} />;
    case "platform-dashboard":
      // Check for platform authentication first
      if (!isPlatformAuthenticated) {
        onNavigate("platform");
        return null;
      }
      
      return (
        <RoleProtectedRoute 
          requiredRoles={['superadmin']} 
          onNavigate={onNavigate}
          redirectPage="platform"
          fallbackMessage="Platform dashboard access is restricted to superadmins only. Please authenticate through the Platform page."
        >
          <ModernPlatformDashboard onNavigate={onNavigate} />
        </RoleProtectedRoute>
      );
    case "project-dashboard":
      return <ProjectDashboard onNavigate={onNavigate} />;
    case "portfolio-manage":
      return <PortfolioManagePage onNavigate={onNavigate} />;
    case "user-profile":
      // Profile page removed - redirect to home
      onNavigate("home");
      return <HomePage onNavigate={onNavigate} onSelectProject={onSelectProject} currentPage={currentPage} />;
    case "portfolio":
      return <PortfolioViewPage onNavigate={onNavigate} />;
    case "reviews":
      return <ReviewsPage onNavigate={onNavigate} />;
    case "personal":
      return <PersonalPage onNavigate={onNavigate} />;
    case "time":
      return <TimePage onNavigate={onNavigate} />;
    case "wellness":
      return <WellnessPage onNavigate={onNavigate} />;
    case "family":
      return <FamilyPage onNavigate={onNavigate} />;
    case "security":
      return <SecurityPage onNavigate={onNavigate} />;
    case "user-management":
      return (
        <RoleProtectedRoute 
          requiredRoles={['superadmin']} 
          onNavigate={onNavigate}
          redirectPage="home"
          fallbackMessage="User management access is restricted to superadmins only."
        >
          <PlatformUserManagement onNavigate={onNavigate} />
        </RoleProtectedRoute>
      );
    case "inbox":
    case "asset":
    case "schedules":
      // Redirect incomplete pages to home
      onNavigate("home");
      return <HomePage onNavigate={onNavigate} onSelectProject={onSelectProject} />;
    default:
      return <LandingPage onNavigate={onNavigate} />;
  }
};