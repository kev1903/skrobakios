import React from 'react';
import { ModernDashboard } from './dashboard/ModernDashboard';

interface FinancePageProps {
  onNavigate?: (page: string) => void;
}

export const FinancePage = ({ onNavigate }: FinancePageProps) => {
  return <ModernDashboard onNavigate={onNavigate} isFinancePage={true} />;
};