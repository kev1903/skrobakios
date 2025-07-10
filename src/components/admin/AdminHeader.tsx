import React from 'react';
import { Button } from '@/components/ui/button';
interface AdminHeaderProps {
  onNavigate: (page: string) => void;
}
export const AdminHeader = ({
  onNavigate
}: AdminHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <Button onClick={() => onNavigate('dashboard')}>
        Dashboard
      </Button>
    </div>
  );
};