import React from 'react';
import { Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimeSectionProps {
  onNavigate?: (page: string) => void;
}

export const TimeSection = ({ onNavigate }: TimeSectionProps) => {
  return (
    <div className="space-y-8">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-white/60 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Time Management</h3>
          <p className="text-white/70 mb-6">Configure your time preferences and schedules</p>
          
          {onNavigate && (
            <Button
              onClick={() => onNavigate('time-management')}
              className="bg-primary hover:bg-primary/80 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Time Management Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};