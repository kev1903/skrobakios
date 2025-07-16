import React from 'react';

interface FullScreenTimelineProps {
  isOpen: boolean;
  onNavigate: (page: string) => void;
  onClose: () => void;
}

export const FullScreenTimeline = ({
  isOpen,
  onNavigate,
  onClose
}: FullScreenTimelineProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 pt-16 pb-20">
        <div 
          className="w-full h-full glass-card"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button for Timeline */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-8 h-8 glass-card rounded-full flex items-center justify-center hover:bg-muted transition-colors duration-200"
          >
            <span className="text-foreground text-lg">×</span>
          </button>
          
          {/* Timeline Content */}
          <div className="p-8 h-full overflow-auto">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-foreground mb-8">Project Timeline</h1>
              
              <div className="space-y-6">
                {/* Timeline items would go here */}
                <div className="text-center text-muted-foreground py-12">
                  <p className="text-lg">Timeline view coming soon</p>
                  <p className="text-sm">This will show project milestones and progress over time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay to close timeline when clicking outside */}
      <div 
        className="fixed inset-0 bg-background/20 backdrop-blur-sm z-30"
        onClick={onClose}
      />
    </>
  );
};