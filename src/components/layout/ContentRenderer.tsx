import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MyTasksPage } from "@/components/MyTasksPage";
import { Mapbox3DEnvironment } from "@/components/Mapbox3DEnvironment";
import { HomePage } from "@/components/HomePage";
import { BusinessMapPage } from "@/components/BusinessMapPage";
import { ProjectDetail } from "@/components/ProjectDetail";
import { BusinessMapbox } from "@/components/mapbox/BusinessMapbox";
import { ProjectSidebar } from "@/components/ProjectSidebar";

import { ProjectSettingsPage } from "@/components/ProjectSettingsPage";
import { ProjectContractsPage } from "@/components/projects/ProjectContractsPage";
import { ProjectTasksPage } from "@/components/ProjectTasksPage";

import { ProjectTimelinePage } from "@/components/ProjectTimelinePage";
import { UploadProject } from "@/components/UploadProject";
import { AuthPage } from "@/components/auth/AuthPage";
import { PlatformSignupPage } from "@/components/auth/PlatformSignupPage";
import { LandingPage } from "@/components/LandingPage";
// UserProfile import removed
import { SubscriptionProtectedRoute } from "@/components/auth/SubscriptionProtectedRoute";

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
import { WBSPage } from "@/components/WBSPage";
import { SalesPage } from "@/components/SalesPage";
import { ProjectTeamPage } from "@/components/projects/ProjectTeamPage";
import { ProjectTeamManagementPage } from "@/components/ProjectTeamManagementPage";
import { ProjectCostPage } from "@/components/project-cost/ProjectCostPage";
import { ProjectFinancePage } from "@/components/project-finance/ProjectFinancePage";

import { TimeManagementPage } from "@/components/TimeManagementPage";

import { AdminPage } from "@/components/admin/AdminPage";
import { CompanySettingsPage } from "@/components/company/CompanySettingsPage";
import { BusinessSettingsPage } from "@/components/BusinessSettingsPage";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";

import { TaskManagement } from "@/components/TaskManagement";
import { Project } from "@/hooks/useProjects";
import { BusinessManagementPage } from "@/components/BusinessManagementPage";
import { CreateBusinessPage } from "@/components/CreateBusinessPage";
import { PortfolioManagePage } from "@/components/portfolio/PortfolioManagePage";
import { PortfolioViewPage } from "@/components/portfolio/PortfolioViewPage";
import { ReviewsPage } from "@/components/review/ReviewsPage";

import { MilestonePage } from "@/components/MilestonePage";
import { PermissionManager } from "@/components/permissions/PermissionManager";
import { PersonalPage } from "@/components/PersonalPage";
import MapComponent from "@/components/map/MapComponent";
import { useAppContext } from "@/contexts/AppContextProvider";
import { PersonalDashboard } from "@/components/personal/PersonalDashboard";
import { PersonalAnalyticsDashboard } from "@/components/personal/PersonalAnalyticsDashboard";
import { TimePage } from "@/components/TimePage";
import { WellnessPage } from "@/components/WellnessPage";
import { FamilyPage } from "@/components/FamilyPage";
import { SecurityPage } from "@/components/SecurityPage";
import NewTaskPage from "@/pages/NewTaskPage";

import { SK25008Dashboard } from "@/components/SK25008Dashboard";
import { ProjectQAQCPage } from "@/components/project/ProjectQAQCPage";
import { ChecklistsPage } from "@/pages/qaqc/ChecklistsPage";
import { RFIsPage } from "@/pages/qaqc/RFIsPage";
import { IssuesPage } from "@/pages/qaqc/IssuesPage";
import { DefectsPage } from "@/pages/qaqc/DefectsPage";
import { InspectionsPage } from "@/pages/qaqc/InspectionsPage";
import { QualityPlansPage } from "@/pages/qaqc/QualityPlansPage";
import { RFIDetailPage } from "@/pages/qaqc/RFIDetailPage";
import { CreateIssueReportPage } from "@/pages/qaqc/CreateIssueReportPage";
import { IssueReportDetailPage } from "@/pages/qaqc/IssueReportDetailPage";
import { IssueReportEditPage } from "@/pages/qaqc/IssueReportEditPage";
import { CreateIssuePage } from "@/pages/qaqc/CreateIssuePage";
import { IssueEditPage } from "@/pages/qaqc/IssueEditPage";


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
  const { isAuthenticated } = useAuth();
  const { activeContext } = useAppContext();
  
  const renderProjectNotFound = () => <div className="flex items-center justify-center h-full">
      <p className="text-slate-500">Project not found</p>
    </div>;
    
  // CRITICAL: Prevent authenticated users from accessing public pages
  const publicPages = ['landing', 'auth', 'platform-signup'];
  if (isAuthenticated && publicPages.includes(currentPage)) {
    console.log(`🚨 SECURITY: Authenticated user blocked from accessing public page: ${currentPage}`);
    onNavigate('profile');
    return <div className="flex items-center justify-center h-full">
      <p className="text-slate-500">Redirecting to your profile...</p>
    </div>;
  }
    
  switch (currentPage) {
    case "landing":
      return <LandingPage onNavigate={onNavigate} />;
    case "auth":
      return <AuthPage onNavigate={onNavigate} />;
    case "platform-signup":
      return <PlatformSignupPage onNavigate={onNavigate} />;
    case "home":
      // Show BusinessMapbox for company context, HomePage for other contexts
      if (activeContext === 'company') {
        return (
          <div className="w-full h-full">
            <BusinessMapbox className="w-full h-full" />
          </div>
        );
      } else {
        return <HomePage onNavigate={onNavigate} onSelectProject={onSelectProject} currentPage={currentPage} />;
      }
    case "tasks":
      return <TaskManagement onNavigate={onNavigate} />;
    case "my-tasks":
      return <MyTasksPage onNavigate={onNavigate} />;
    case "task-create":
      return <NewTaskPage />;
    case "milestones":
      return <MilestonePage onNavigate={onNavigate} />;
    case "time-management":
      return <TimeManagementPage onNavigate={onNavigate} />;
    case "settings":
      return <BusinessSettingsPage onNavigate={onNavigate} />;
    case "admin":
      // Redirect admin to company settings page with admin tab
      onNavigate("company-settings");
      return <CompanySettingsPage onNavigate={onNavigate} />;
    case "create-project":
      return (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <CreateProject onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
    case "projects":
      return (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <ProjectList onNavigate={onNavigate} onSelectProject={onSelectProject} />
        </SubscriptionProtectedRoute>
      );
    case "individual-project-dashboard":
      return (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <SK25008Dashboard projectId={selectedProject || ""} />
        </SubscriptionProtectedRoute>
      );
    case "project-detail":
      return (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <ProjectDetail projectId={selectedProject} onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
    case "project-tasks":
      return currentProject ? (
        <SubscriptionProtectedRoute requiredFeature="basic_tasks" onNavigate={onNavigate}>
          <ProjectTasksPage project={currentProject} onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      ) : renderProjectNotFound();
    case "project-timeline":
      return currentProject ? (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <ProjectTimelinePage project={currentProject} onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
       ) : renderProjectNotFound();
    case "project-team":
      return currentProject ? (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <ProjectTeamManagementPage project={currentProject} onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      ) : renderProjectNotFound();
    case "project-settings":
      return currentProject ? (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <ProjectSettingsPage project={currentProject} onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      ) : renderProjectNotFound();
    case "project-contracts":
      return currentProject ? (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <ProjectContractsPage project={currentProject} onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      ) : renderProjectNotFound();
    case "sk25008-schedule":
      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get('projectId') || 'sk-25008';
      return (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <SK25008Dashboard projectId={projectId} />
        </SubscriptionProtectedRoute>
      );
    case "project-digital-twin":
      return currentProject ? (
        <SubscriptionProtectedRoute requiredFeature="advanced_projects" onNavigate={onNavigate}>
          <Mapbox3DEnvironment onNavigate={onNavigate} currentProject={currentProject} />
        </SubscriptionProtectedRoute>
      ) : renderProjectNotFound();
    case "project-wbs":
      return currentProject ? (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <WBSPage project={currentProject} onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      ) : renderProjectNotFound();
    case "upload":
      return (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <UploadProject onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
    case "files":
      return (
        <SubscriptionProtectedRoute requiredFeature="basic_files" onNavigate={onNavigate}>
          <FilePage onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
    case "finance":
      return (
        <SubscriptionProtectedRoute requiredFeature="cost_contracts" onNavigate={onNavigate}>
          <FinancePage onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
    case "finance-settings":
      return (
        <SubscriptionProtectedRoute requiredFeature="cost_contracts" onNavigate={onNavigate}>
          <FinanceSettingsPage onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
    case "cashflow":
      return (
        <SubscriptionProtectedRoute requiredFeature="cost_contracts" onNavigate={onNavigate}>
          <CashFlowPage onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
    case "invoices":
      return (
        <SubscriptionProtectedRoute requiredFeature="cost_contracts" onNavigate={onNavigate}>
          <InvoicesPage onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
    case "bills":
      return (
        <SubscriptionProtectedRoute requiredFeature="cost_contracts" onNavigate={onNavigate}>
          <BillsPage onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
    case "recurring":
      return (
        <SubscriptionProtectedRoute requiredFeature="cost_contracts" onNavigate={onNavigate}>
          <RecurringPage onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
    case "sales":
      return (
        <SubscriptionProtectedRoute requiredFeature="sales_management" onNavigate={onNavigate}>
          <SalesPage onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
    case "system":
      return <BusinessMapPage onNavigate={onNavigate} />;
    case "business-invitations":
      // Business invitations removed - redirect to home
      onNavigate("home");
      return <HomePage onNavigate={onNavigate} onSelectProject={onSelectProject} currentPage={currentPage} />;
    case "team-management":
      return <PermissionManager onNavigate={onNavigate} currentPage={currentPage} />;
    case "platform-admin":
      return <PermissionManager onNavigate={onNavigate} currentPage={currentPage} />;
    case "invitation-acceptance":
      // Invitation acceptance removed - redirect to home
      onNavigate("home");
      return <HomePage onNavigate={onNavigate} onSelectProject={onSelectProject} currentPage={currentPage} />;
    case "project-cost":
      return (
        <SubscriptionProtectedRoute requiredFeature="cost_contracts" onNavigate={onNavigate}>
          {currentProject ? (
            <ProjectCostPage project={currentProject} onNavigate={onNavigate} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500">Loading project...</p>
            </div>
          )}
        </SubscriptionProtectedRoute>
      );
    case "project-finance":
      return currentProject ? (
        <SubscriptionProtectedRoute requiredFeature="cost_contracts" onNavigate={onNavigate}>
          <ProjectFinancePage project={currentProject} onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      ) : renderProjectNotFound();
    case "project-qaqc":
      return (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <ProjectQAQCPage onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
    case "qaqc-checklists":
      return (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <ChecklistsPage onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
    case "qaqc-rfis":
      return (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <RFIsPage onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
    case "qaqc-issues":
      return (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <IssuesPage onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
    case "qaqc-defects":
      return (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <DefectsPage onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
    case "qaqc-inspections":
      return (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <InspectionsPage onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
    case "qaqc-quality-plans":
      return (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <QualityPlansPage onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
    case "qaqc-issue-report-create":
      return (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <CreateIssueReportPage />
        </SubscriptionProtectedRoute>
      );
    case "qaqc-issue-report-detail":
      return (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <IssueReportDetailPage onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
    case "qaqc-issue-report-edit":
      return (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <IssueReportEditPage onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
     case "qaqc-issue-detail":
      // Redirect old issue detail route to project QA/QC page  
      const issueUrlParams = new URLSearchParams(window.location.search);
      const issueProjectId = issueUrlParams.get('projectId');
      if (issueProjectId) {
        onNavigate(`project-qaqc?projectId=${issueProjectId}&tab=issues`);
      } else {
        onNavigate('projects');
      }
      return <div className="flex items-center justify-center h-full">
        <p className="text-slate-500">Redirecting...</p>
      </div>;
    case "qaqc-issue-create":
      return (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <CreateIssuePage onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
    case "qaqc-issue-edit":
      return (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <IssueEditPage onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
    case "qaqc-rfi-detail":
      return (
        <SubscriptionProtectedRoute requiredFeature="projects" onNavigate={onNavigate}>
          <RFIDetailPage onNavigate={onNavigate} />
        </SubscriptionProtectedRoute>
      );
    case "bim":
      return currentProject ? (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-white">Digital Objects</h1>
            <p className="text-white/70">This feature has been removed.</p>
          </div>
      ) : renderProjectNotFound();
    case "3d-environment":
      return <Mapbox3DEnvironment onNavigate={onNavigate} currentProject={null} />;
    case "support":
      return <SupportPage />;
    case "subscription":
      window.location.href = "/subscription";
      return null;
    case "profile":
    case "user-edit":
    case "existing-user-profile":
    case "user-profile":
      // Show Personal Analytics Dashboard for personal context, redirect to home for company context
      console.log('🗺️ ContentRenderer: Profile page requested, activeContext:', activeContext);
      if (activeContext === 'personal') {
        console.log('📄 ContentRenderer: Showing PersonalAnalyticsDashboard for personal context');
        return <PersonalAnalyticsDashboard onNavigate={onNavigate} />;
      } else {
        console.log('🗺️ ContentRenderer: Redirecting to home for company context');
        onNavigate("home");
        return null;
      }
    case "company-settings":
      return <CompanySettingsPage onNavigate={onNavigate} />;
    case "business":
    case "business-management":
      return <BusinessManagementPage onNavigate={onNavigate} />;
    case "create-business":
      return <CreateBusinessPage onNavigate={onNavigate} />;
    case "platform":
      // Platform removed - redirect to home
      onNavigate("home");
      return <HomePage onNavigate={onNavigate} onSelectProject={onSelectProject} currentPage={currentPage} />;
    case "platform-dashboard":
    case "personal-dashboard":
      return <PersonalAnalyticsDashboard onNavigate={onNavigate} />;
    case "project-dashboard":
      // Redirect to projects list instead
      onNavigate("projects");
      return <ProjectList onNavigate={onNavigate} onSelectProject={onSelectProject} />;
    case "portfolio-manage":
      return <PortfolioManagePage onNavigate={onNavigate} />;
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
      // User management removed - redirect to home  
      onNavigate("home");
      return <HomePage onNavigate={onNavigate} onSelectProject={onSelectProject} currentPage={currentPage} />;
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