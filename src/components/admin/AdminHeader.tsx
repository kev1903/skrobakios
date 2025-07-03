
import React from 'react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  onNavigate: (page: string) => void;
}

export const AdminHeader = ({ onNavigate }: AdminHeaderProps) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
      <p className="text-gray-600 mt-1">Manage users and their roles</p>
    </div>
  );
};
