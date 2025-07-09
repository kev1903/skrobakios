
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import { InvitationAcceptPage } from "./components/team/InvitationAcceptPage";
import { UserInvitationAcceptPage } from "./components/admin/UserInvitationAcceptPage";
import { CostContractsPage } from "./components/CostContractsPage";
import { InvoicesPage } from "./components/InvoicesPage";
import { EstimatesPage } from "./components/EstimatesPage";
import { InvoiceDetailsPage } from "./components/InvoiceDetailsPage";

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


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/invoices" element={<InvoicesPageWrapper />} />
          <Route path="/invoice-details/:invoiceId" element={<InvoiceDetailsPage />} />
          <Route path="/cost-contracts" element={<CostContractsPage />} />
          <Route path="/estimates" element={<EstimatesPageWrapper />} />
          <Route path="/accept-invitation" element={<InvitationAcceptPage />} />
          <Route path="/accept-user-invitation" element={<UserInvitationAcceptPage />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
