import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navigation, Globe, Map, Layers, Bookmark } from 'lucide-react';

interface NavigationPanelProps {
  onNavigate: (page: string) => void;
  onSaveView: () => void;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({ onNavigate, onSaveView }) => {
  return (
    <Card className="absolute top-6 left-6 z-40 bg-black/10 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50">
      <CardContent className="p-5">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">Navigation</span>
        </div>
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('dashboard')}
            className="w-full justify-start text-white hover:bg-white/15 hover:backdrop-blur-sm transition-all duration-300 rounded-lg"
          >
            <Globe className="w-4 h-4 mr-3" />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('projects')}
            className="w-full justify-start text-white hover:bg-white/15 hover:backdrop-blur-sm transition-all duration-300 rounded-lg"
          >
            <Map className="w-4 h-4 mr-3" />
            Projects
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('tasks')}
            className="w-full justify-start text-white hover:bg-white/15 hover:backdrop-blur-sm transition-all duration-300 rounded-lg"
          >
            <Layers className="w-4 h-4 mr-3" />
            Tasks
          </Button>
          <div className="border-t border-white/20 my-3"></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSaveView}
            className="w-full justify-start text-white hover:bg-white/15 hover:backdrop-blur-sm transition-all duration-300 rounded-lg"
          >
            <Bookmark className="w-4 h-4 mr-3" />
            Save View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};