import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectPageHeaderProps {
  projectName: string;
  pageTitle: string;
  onNavigate: (page: string) => void;
  actions?: React.ReactNode;
}

export const ProjectPageHeader = ({ projectName, pageTitle, onNavigate, actions }: ProjectPageHeaderProps) => {
  return (
    <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-6 py-4">
      </div>
    </div>
  );
};
