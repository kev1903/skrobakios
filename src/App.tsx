import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";
import Index from "./pages/Index";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import { CompanyProvider } from "./contexts/CompanyContext";
import { PlatformAuthProvider } from "./contexts/PlatformAuthContext";
import { AppContextProvider } from "./contexts/AppContextProvider";
import { CostContractsPage } from "./components/CostContractsPage";
import { InvoicesPage } from "./components/InvoicesPage";
import { EstimatesPage } from "./components/EstimatesPage";
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
import { ProjectTeamPage } from "./components/projects/team/ProjectTeamPage";
import { SubscriptionPage } from "./pages/SubscriptionPage";
import { SK25008Dashboard } from "./components/SK25008Dashboard";

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

  return <InvoicesPage onNavigate={handleNavigate} />;
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

  return <EstimatesPage onNavigate={handleNavigate} />;
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

  return <EstimateCreationPage onNavigate={handleNavigate} />;
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
            <PlatformAuthProvider>
              <ImpersonationGuard>
                <AppContent />
              </ImpersonationGuard>
            </PlatformAuthProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const AppContent = () => {
  const { impersonationMode } = useAuth();

  return (
    <>
      {impersonationMode.isImpersonating && impersonationMode.targetUserInfo && (
        <ImpersonationBanner impersonatedUser={impersonationMode.targetUserInfo} />
      )}
      <Routes>
        <Route path="/" element={
          <PlatformAuthProvider>
            <UserProvider>
              <CompanyProvider>
                <AppContextProvider>
                  <Index />
                </AppContextProvider>
              </CompanyProvider>
            </UserProvider>
          </PlatformAuthProvider>
        } />
        <Route path="/invoices" element={<InvoicesPageWrapper />} />
        <Route path="/invoice-details/:invoiceId" element={<InvoiceDetailsPage />} />
        <Route path="/cost-contracts" element={<CostContractsPage />} />
        <Route path="/estimates" element={<EstimatesPageWrapper />} />
        <Route path="/estimates/new" element={<EstimateCreationPageWrapper />} />
        <Route path="/company/:companyId/edit" element={
          <PlatformAuthProvider>
            <UserProvider>
              <CompanyProvider>
                <CompanyEditPageWrapper />
              </CompanyProvider>
            </UserProvider>
          </PlatformAuthProvider>
        } />
        {/* Profile edit route removed */}
        <Route path="/impersonate" element={
          <PlatformAuthProvider>
            <UserProvider>
              <CompanyProvider>
                <Index />
              </CompanyProvider>
            </UserProvider>
          </PlatformAuthProvider>
        } />
        
        {/* Public Routes - No authentication required */}
        <Route path="/directory" element={<PublicDirectory />} />
        <Route path="/profile/:slug" element={<PublicUserProfile />} />
        <Route path="/company/:slug" element={<PublicCompanyProfile />} />
        <Route path="/reviews" element={<ReviewsPageWrapper />} />
        <Route path="/invite/:token" element={<InvitePage />} />
        
        {/* Subscription Management */}
        <Route path="/subscription" element={
          <PlatformAuthProvider>
            <UserProvider>
              <CompanyProvider>
                <SubscriptionPageWrapper />
              </CompanyProvider>
            </UserProvider>
          </PlatformAuthProvider>
        } />
        
        {/* Protected Project Routes */}
        <Route path="/projects/:projectId/team" element={
          <PlatformAuthProvider>
            <UserProvider>
              <CompanyProvider>
                <ProjectTeamPage />
              </CompanyProvider>
            </UserProvider>
          </PlatformAuthProvider>
        } />
        
        {/* SK25008 Project Dashboard */}
        <Route path="/sk25008" element={
          <PlatformAuthProvider>
            <UserProvider>
              <CompanyProvider>
                <SK25008Dashboard />
              </CompanyProvider>
            </UserProvider>
          </PlatformAuthProvider>
        } />
      </Routes>
    </>
  );
};

export default App;