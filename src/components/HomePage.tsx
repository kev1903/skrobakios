import React from 'react';
import { ModernDashboard } from './dashboard/ModernDashboard';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onSelectProject?: (projectId: string) => void;
  currentPage?: string;
}

export const HomePage = ({ onNavigate, onSelectProject, currentPage = "" }: HomePageProps) => {
  return <ModernDashboard onNavigate={onNavigate} />;
};