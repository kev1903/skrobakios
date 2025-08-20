import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MilestoneTracker } from './milestones/MilestoneTracker';

interface MilestonePageProps {
  onNavigate: (page: string) => void;
}

export const MilestonePage = ({ onNavigate }: MilestonePageProps) => {
  return (
    <div className="fixed inset-0 bg-background z-40 h-full overflow-y-auto">
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
        <div className="relative z-10 p-6">
          {/* Back Button */}
          <div className="mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate("home")}
              className="flex items-center space-x-2 text-foreground hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </div>

          {/* Milestone Tracker */}
          <MilestoneTracker onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
};