import React from 'react';
import { Calendar } from 'lucide-react';

interface SchedulePageProps {
  onNavigate?: (page: string) => void;
}

export const SchedulePage = ({ onNavigate }: SchedulePageProps) => {
  return (
    <div className="flex items-center justify-center min-h-0 flex-1 mx-6 my-8">
      <div className="w-full max-w-4xl bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-3 text-center">
            <Calendar className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white font-poppins">My Schedule</h1>
              <p className="text-white/70 font-inter">Manage your daily appointments and tasks</p>
            </div>
          </div>
        </div>
        
        {/* Content area */}
        <div className="min-h-[300px] flex items-center justify-center">
          <p className="text-white/60 text-lg">Schedule content will appear here</p>
        </div>
      </div>
    </div>
  );
};