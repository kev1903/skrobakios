import React from 'react';
import { MessageSquare, Layout } from 'lucide-react';

interface MobileViewToggleProps {
  activeView: 'chat' | 'app';
  onViewChange: (view: 'chat' | 'app') => void;
}

export const MobileViewToggle = ({ activeView, onViewChange }: MobileViewToggleProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-center h-16">
        <div className="flex items-center bg-muted/50 rounded-full p-1 backdrop-blur-xl border border-border/50">
          <button
            onClick={() => onViewChange('chat')}
            className={`flex items-center justify-center gap-2 px-6 py-2 rounded-full transition-all duration-200 ${
              activeView === 'chat'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium">Chat</span>
          </button>
          <button
            onClick={() => onViewChange('app')}
            className={`flex items-center justify-center gap-2 px-6 py-2 rounded-full transition-all duration-200 ${
              activeView === 'app'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span className="text-sm font-medium">SkrobakiOS</span>
          </button>
        </div>
      </div>
    </div>
  );
};