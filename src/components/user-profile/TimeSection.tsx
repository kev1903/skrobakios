import React from 'react';
import { Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimeSectionProps {
  onNavigate?: (page: string) => void;
}

export const TimeSection = ({ onNavigate }: TimeSectionProps) => {
  return (
    <div className="space-y-8">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
        <div className="text-center py-12">
          <Timer className="w-16 h-16 text-white/60 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-6">Time Management</h3>
          
          {onNavigate && (
            <Button
              onClick={() => onNavigate('time-management')}
              className="bg-primary hover:bg-primary/80 text-white px-8 py-3 text-lg"
            >
              <Timer className="w-5 h-5 mr-2" />
              Time Management
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};