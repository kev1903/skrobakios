import React from 'react';
import { Calendar } from 'lucide-react';

interface SchedulePageProps {
  onNavigate?: (page: string) => void;
}

export const SchedulePage = ({ onNavigate }: SchedulePageProps) => {
  return (
    <div className="h-96 bg-white/5 backdrop-blur-sm overflow-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white font-poppins">My Schedule</h1>
              <p className="text-white/70 font-inter">Manage your daily appointments and tasks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};