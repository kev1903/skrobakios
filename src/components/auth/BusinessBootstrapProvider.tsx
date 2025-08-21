import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { BusinessCreationModal } from '@/components/BusinessCreationModal';
import { useNavigate } from 'react-router-dom';

interface BusinessBootstrapProviderProps {
  children: React.ReactNode;
}

export const BusinessBootstrapProvider: React.FC<BusinessBootstrapProviderProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { companies, loading: companiesLoading } = useCompany();
  const navigate = useNavigate();
  
  const [showBusinessCreation, setShowBusinessCreation] = useState(false);
  const [hasCheckedBootstrap, setHasCheckedBootstrap] = useState(false);

  useEffect(() => {
    // Only check after auth and companies have loaded
    if (authLoading || companiesLoading || !user || hasCheckedBootstrap) {
      return;
    }

    // If user has no companies, prompt them to create one
    if (companies.length === 0) {
      setShowBusinessCreation(true);
    }
    
    setHasCheckedBootstrap(true);
  }, [user, companies, authLoading, companiesLoading, hasCheckedBootstrap]);

  const handleBusinessCreated = (businessId: string) => {
    setShowBusinessCreation(false);
    // Navigate to the new business dashboard
    navigate('/?page=home');
  };

  const handleSkipCreation = () => {
    setShowBusinessCreation(false);
    // Allow user to continue without creating a business
  };

  return (
    <>
      {children}
      
      <BusinessCreationModal
        open={showBusinessCreation}
        onClose={handleSkipCreation}
        onSuccess={handleBusinessCreated}
      />
    </>
  );
};