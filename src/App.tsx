import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation, useSearchParams } from "react-router-dom";
import Index from "./pages/Index";
import TasksPage from "./pages/TasksPage";
import TimeSheetPage from "./pages/TimeSheetPage";
import DashboardPage from "./pages/DashboardPage";
import NewTaskPage from "./pages/NewTaskPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import { CompanyProvider } from "./contexts/CompanyContext";
import { TimeTrackingProvider } from "./contexts/TimeTrackingContext";

import { AppContextProvider } from "./contexts/AppContextProvider";
import { useIsMobile } from "@/hooks/use-mobile";



import { InvoicesPage } from "./components/InvoicesPage";
import { EstimatesPage } from "./components/EstimatesPage";
import { EstimationLibraryPage } from "./components/EstimationLibraryPage";
import { EstimateCreationPage } from "./components/EstimateCreationPage";
import { InvoiceDetailsPage } from "./components/InvoiceDetailsPage";
import { CompanyEditPage } from "./components/CompanyEditPage";
import { UserProfileEditPage } from "./components/admin/UserProfileEditPage";
import { ImpersonationGuard } from "./components/admin/ImpersonationGuard";
import { ImpersonationBanner } from "./components/admin/ImpersonationBanner";
import { PublicUserProfile } from "./components/public/PublicUserProfile";
import { PublicCompanyProfile } from "./components/public/PublicCompanyProfile";
import { PublicDirectory } from "./components/public/PublicDirectory";
import { ReviewsPage } from "./components/review/ReviewsPage";
import { InvitePage } from "./pages/InvitePage";
import { InvitationSignupPage } from "./components/auth/InvitationSignupPage";
import { MenuBar } from "./components/MenuBar";
import PDFExtractionDocs from "./pages/PDFExtractionDocs";

import { SubscriptionPage } from "./pages/SubscriptionPage";
import { SK25008Dashboard } from "./components/SK25008Dashboard";
import { GlobalSidebarProvider } from "./contexts/GlobalSidebarContext";
import { GlobalSidebar } from "./components/GlobalSidebar";
import { InputDataPage } from "./components/sales/pages/InputDataPage";
import { TakeOffPage } from "./components/sales/pages/TakeOffPage";
import { CostDatabasePage } from "./components/sales/pages/CostDatabasePage";
import { EstimationProcessPage } from "./components/sales/pages/EstimationProcessPage";
import { OutputIntegrationPage } from "./components/sales/pages/OutputIntegrationPage";
import { EstimateProvider } from "./components/sales/context/EstimateContext";

// Wrapper component for InvoicesPage with proper navigation
const InvoicesPageWrapper = () => {
  const navigate = useNavigate();
  
  const handleNavigate = (page: string) => {
    if (page === 'finance') {
      navigate('/?page=finance');
    } else {
      navigate(`/?page=${page}`);
    }
  };

  return (
    <InvoicesPage onNavigate={handleNavigate} />
  );
};

// Wrapper component for EstimatesPage with proper navigation
const EstimatesPageWrapper = () => {
  const navigate = useNavigate();
  
  const handleNavigate = (page: string) => {
    if (page === 'sales') {
      navigate('/?page=sales');
    } else {
      navigate(`/?page=${page}`);
    }
  };

  return (
    <EstimatesPage onNavigate={handleNavigate} />
  );
};

// Wrapper component for EstimateCreationPage with proper navigation
const EstimateCreationPageWrapper = () => {
  const navigate = useNavigate();
  
  const handleNavigate = (page: string) => {
    if (page === 'estimates') {
      navigate('/estimates');
    } else {
      navigate(`/?page=${page}`);
    }
  };

  return (
    <EstimateCreationPage onNavigate={handleNavigate} />
  );
};

// Wrapper for editing existing estimate - Step 1 (Input Data)
const EstimateEditPageWrapper = () => {
  const navigate = useNavigate();
  const { estimateId } = useParams<{ estimateId: string }>();
  const handleBack = () => navigate('/estimates');
  return <InputDataPage onBack={handleBack} estimateId={estimateId} />;
};

// Wrapper component for EstimationLibraryPage with proper navigation
const EstimationLibraryPageWrapper = () => {
  const navigate = useNavigate();
  
  const handleNavigate = (page: string) => {
    if (page === 'sales') {
      navigate('/?page=sales');
    } else {
      navigate(`/?page=${page}`);
    }
  };

  return (
    <EstimationLibraryPage onNavigate={handleNavigate} />
  );
};

// Wrapper component for CompanyEditPage with proper navigation
const CompanyEditPageWrapper = () => {
  const navigate = useNavigate();
  const { companyId } = useParams<{ companyId: string }>();
  
  const handleNavigateBack = () => {
    navigate('/?page=platform-dashboard');
  };

  return <CompanyEditPage companyId={companyId || ''} onNavigateBack={handleNavigateBack} />;
};

// Wrapper component for ReviewsPage with proper navigation
const ReviewsPageWrapper = () => {
  const navigate = useNavigate();
  
  const handleNavigate = (page: string) => {
    navigate(`/?page=${page}`);
  };

  return <ReviewsPage onNavigate={handleNavigate} />;
};

// Wrapper component for SubscriptionPage with proper navigation
const SubscriptionPageWrapper = () => {
  const navigate = useNavigate();
  
  const handleNavigate = (page: string) => {
    navigate(`/?page=${page}`);
  };

  return <SubscriptionPage onNavigate={handleNavigate} />;
};

// Wrapper component for Project Dashboard with dynamic projectId
const ProjectDashboardWrapper = () => {
  const { projectId } = useParams<{ projectId: string }>();

  return <SK25008Dashboard projectId={projectId} />;
};

const App = () => {
  // Create QueryClient inside the component to ensure React is initialized
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ImpersonationGuard>
              <AppContent />
            </ImpersonationGuard>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const AppContent = () => {
  const { impersonationMode, user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Check if we're specifically on the landing page (not authenticated home page)
  // Landing page is when we're on "/" and either no page param or page=landing, AND user is not authenticated
  const isLandingPage = location.pathname === "/" && (!searchParams.get('page') || searchParams.get('page') === 'landing') && !user;
  // Check if we're on the auth page
  const isAuthPage = location.pathname === "/" && searchParams.get('page') === 'auth';
  // Check if we're on the sign up page
  const isSignUpPage = location.pathname === "/" && searchParams.get('page') === 'signup';
  // Check if we're on the home page (authenticated users on "/" or "/?page=home")
  const isHomePage = location.pathname === "/" && (searchParams.get('page') === 'home' || (!searchParams.get('page') && user));

  // Derive a currentPage identifier for GlobalSidebar on non-root routes
  const navigateRouter = useNavigate();
  const currentPageForSidebar = React.useMemo(() => {
    if (location.pathname === "/tasks") return "tasks";
    if (location.pathname === "/dashboard") return "system";
    if (location.pathname.startsWith("/estimates")) return "sales";
    if (location.pathname === "/invoices") return "finance";
    if (location.pathname === "/") return searchParams.get('page') || (user ? 'home' : 'landing');
    return "home";
  }, [location.pathname, searchParams, user]);

  const handleSidebarNavigate = (page: string) => {
    switch (page) {
      case "tasks":
        navigateRouter("/tasks");
        break;
      default:
        navigateRouter(`/?page=${page}`);
        break;
    }
  };

  const isMobile = useIsMobile();
  const showMenuBar = (((user && !isLandingPage && !isAuthPage && !isSignUpPage) || isHomePage) && !(isHomePage && isMobile));

  return (
    <GlobalSidebarProvider>
      <AppContextProvider>
        <UserProvider>
          <CompanyProvider>
            <TimeTrackingProvider>
            <>
              {impersonationMode.isImpersonating && impersonationMode.targetUserInfo && (
                <ImpersonationBanner impersonatedUser={impersonationMode.targetUserInfo} />
              )}
            {showMenuBar ? <MenuBar /> : null}
            <Routes>
        <Route path="/" element={
          <Index />
        } />
        <Route path="/invoices" element={<InvoicesPageWrapper />} />
        <Route path="/invoice-details/:invoiceId" element={<InvoiceDetailsPage />} />
        
<Route path="/estimates" element={<EstimatesPageWrapper />} />
<Route path="/estimates/new" element={<EstimateCreationPageWrapper />} />
<Route path="/estimates/edit/:estimateId" element={
  <EstimateProvider>
    <EstimateEditPageWrapper />
  </EstimateProvider>
} />
<Route path="/estimates/edit/:estimateId/take-off" element={
  <EstimateProvider>
    <TakeOffPage />
  </EstimateProvider>
} />
<Route path="/estimates/edit/:estimateId/cost-db" element={
  <EstimateProvider>
    <CostDatabasePage />
  </EstimateProvider>
} />
<Route path="/estimates/edit/:estimateId/estimation" element={
  <EstimateProvider>
    <EstimationProcessPage />
  </EstimateProvider>
} />
<Route path="/estimates/edit/:estimateId/output" element={
  <EstimateProvider>
    <OutputIntegrationPage />
  </EstimateProvider>
} />
        <Route path="/company/:companyId/edit" element={<CompanyEditPageWrapper />} />
        {/* Profile edit route removed */}
        <Route path="/impersonate" element={<Index />} />
        
        {/* Public Routes - No authentication required */}
        <Route path="/directory" element={<PublicDirectory />} />
        <Route path="/profile/:slug" element={<PublicUserProfile />} />
        <Route path="/company/:slug" element={<PublicCompanyProfile />} />
        <Route path="/reviews" element={<ReviewsPageWrapper />} />
        <Route path="/invite/:token" element={<InvitePage />} />
        <Route path="/invitation-signup" element={<InvitationSignupPage />} />
        
        {/* Subscription Management */}
        <Route path="/subscription" element={<SubscriptionPageWrapper />} />
        
        {/* Tasks Management */}
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/timesheet" element={<TimeSheetPage />} />
        <Route path="/tasks/new" element={<NewTaskPage />} />
        
        {/* Dashboard Analytics Page */}
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* SK25008 Project Dashboard */}
        <Route path="/sk25008" element={<SK25008Dashboard />} />
        
        {/* Dynamic Project Dashboard */}
        <Route path="/project-dashboard/:projectId" element={<ProjectDashboardWrapper />} />
        
        {/* Documentation Pages */}
        <Route path="/docs/pdf-extraction" element={<PDFExtractionDocs />} />
      </Routes>
      {location.pathname !== "/" && (
        <GlobalSidebar currentPage={currentPageForSidebar} onNavigate={handleSidebarNavigate} />
      )}
            </>
          </TimeTrackingProvider>
        </CompanyProvider>
      </UserProvider>
    </AppContextProvider>
    </GlobalSidebarProvider>
  );
};

export default App;