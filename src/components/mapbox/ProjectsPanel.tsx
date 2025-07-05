import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface ProjectsPanelProps {
  loadingProjects: boolean;
  projectMarkersCount: number;
  totalProjectsCount: number;
}

export const ProjectsPanel = ({ 
  loadingProjects, 
  projectMarkersCount, 
  totalProjectsCount 
}: ProjectsPanelProps) => {
  return (
    <Card className="absolute bottom-6 right-6 z-40 bg-black/10 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50">
      <CardContent className="p-5">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
            <MapPin className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-white font-semibold text-lg">Projects</span>
        </div>
        <div className="text-white space-y-3">
          {loadingProjects ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-sm text-slate-300">Loading projects...</div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 backdrop-blur-sm">
                <span className="text-sm text-slate-300">On Map</span>
                <span className="text-xl font-bold text-blue-400">{projectMarkersCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 backdrop-blur-sm">
                <span className="text-sm text-slate-300">Total Found</span>
                <span className="text-xl font-bold text-white">{totalProjectsCount}</span>
              </div>
              {totalProjectsCount > projectMarkersCount && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-400/20">
                  <div className="text-xs text-amber-300 font-medium">
                    {totalProjectsCount - projectMarkersCount} projects missing location data
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};