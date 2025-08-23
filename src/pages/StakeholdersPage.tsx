import React, { useState } from 'react';
import { StakeholdersList } from '@/components/stakeholders/StakeholdersList';
import { StakeholderDetail } from '@/components/stakeholders/StakeholderDetail';

export const StakeholdersPage = () => {
  const [selectedStakeholderId, setSelectedStakeholderId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Get category from URL params if present
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
      setCategoryFilter(category);
    }
  }, []);

  const handleStakeholderSelect = (stakeholderId: string) => {
    setSelectedStakeholderId(stakeholderId);
  };

  const handleBack = () => {
    setSelectedStakeholderId(null);
  };

  return (
    <div className="flex-1 bg-background">
      {selectedStakeholderId ? (
        <StakeholderDetail 
          stakeholderId={selectedStakeholderId}
          onBack={handleBack}
        />
      ) : (
        <StakeholdersList 
          categoryFilter={categoryFilter}
          onStakeholderSelect={handleStakeholderSelect}
        />
      )}
    </div>
  );
};