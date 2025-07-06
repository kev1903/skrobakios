import React from 'react';
import { PasswordUpdateSection } from '@/components/user-edit/PasswordUpdateSection';

export const SecuritySection = () => {
  return (
    <div className="space-y-8">
      {/* Password Update Section */}
      <div className="glass-card p-6">
        <PasswordUpdateSection />
      </div>
    </div>
  );
};