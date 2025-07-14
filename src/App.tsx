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
  const { impersonationMode } = useAuth();

  return (
    <>
      {impersonationMode.isImpersonating && impersonationMode.targetUserInfo && (
        <ImpersonationBanner impersonatedUser={impersonationMode.targetUserInfo} />
      )}
      <Routes>
        <Route path="/" element={
          <UserProvider>
            <CompanyProvider>
              <AppContextProvider>
                <Index />
              </AppContextProvider>
            </CompanyProvider>
          </UserProvider>
        } />
        <Route path="/invoices" element={<InvoicesPageWrapper />} />
        <Route path="/invoice-details/:invoiceId" element={<InvoiceDetailsPage />} />
        <Route path="/cost-contracts" element={<CostContractsPage />} />
        <Route path="/estimates" element={<EstimatesPageWrapper />} />
        <Route path="/estimates/new" element={<EstimateCreationPageWrapper />} />
        <Route path="/company/:companyId/edit" element={
          <UserProvider>
            <CompanyProvider>
              <CompanyEditPageWrapper />
            </CompanyProvider>
          </UserProvider>
        } />
        <Route path="/user-profile/edit" element={
          <UserProvider>
            <CompanyProvider>
              <UserProfileEditPage />
            </CompanyProvider>
          </UserProvider>
        } />
        <Route path="/impersonate" element={
          <UserProvider>
            <CompanyProvider>
              <Index />
            </CompanyProvider>
          </UserProvider>
        } />
      </Routes>
    </>
  );
};

export default App;