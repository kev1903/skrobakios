import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TeamBreadcrumbProps {
  companyId: string;
  companyName?: string;
}

export const TeamBreadcrumb: React.FC<TeamBreadcrumbProps> = ({ companyId, companyName }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4 mb-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/?page=platform-dashboard')}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>
      
      <div className="flex items-center gap-2 text-muted-foreground">
        <Building2 className="w-4 h-4" />
        <span>{companyName || 'Company'}</span>
        <span>/</span>
        <Users className="w-4 h-4" />
        <span>Team Management</span>
      </div>
    </div>
  );
};