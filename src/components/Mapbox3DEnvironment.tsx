import React, { useEffect } from 'react';
import { useMapbox3D } from '@/hooks/useMapbox3D';
import { useProjectMarkers } from '@/hooks/useProjectMarkers';
import { NavigationPanel } from '@/components/mapbox/NavigationPanel';
import { InfoPanel } from '@/components/mapbox/InfoPanel';
import { ProjectsStatusPanel } from '@/components/mapbox/ProjectsStatusPanel';
import { saveCurrentView } from '@/utils/mapboxUtils';
import { useToast } from '@/hooks/use-toast';

interface Mapbox3DEnvironmentProps {
  onNavigate: (page: string) => void;
}


export const Mapbox3DEnvironment = ({ onNavigate }: Mapbox3DEnvironmentProps) => {
  const { toast } = useToast();
  const { mapContainer, map, isLoaded } = useMapbox3D();
  const { projects, projectMarkers, loadingProjects } = useProjectMarkers(map, isLoaded);

  const handleSaveView = () => {
    if (!map) {
      toast({
        title: "Error",
        description: "Map not initialized",
        variant: "destructive",
      });
      return;
    }
    
    const savedView = saveCurrentView(map);
    if (savedView) {
      toast({
        title: "View Saved Successfully",
        description: `Position saved: Zoom ${savedView.zoom.toFixed(1)}, Pitch ${savedView.pitch.toFixed(0)}°`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save view position",
        variant: "destructive",
      });
    }
  };

  // Handle project selection from popup
  useEffect(() => {
    (window as any).selectProject = (projectId: string) => {
      // Navigate to project detail page
      // This would need to be implemented based on your navigation system
      onNavigate('project-detail');
    };

    return () => {
      delete (window as any).selectProject;
    };
  }, [onNavigate]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Map Container - Full screen */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" style={{ minHeight: '100vh' }} />
      
      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-slate-950/90 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto shadow-lg"></div>
            <div className="text-white text-xl font-semibold tracking-wide">Loading 3D Environment...</div>
            <div className="text-slate-300 text-sm">Initializing Mapbox Globe</div>
          </div>
        </div>
      )}

      <NavigationPanel onNavigate={onNavigate} onSaveView={handleSaveView} />
      <InfoPanel />
      <ProjectsStatusPanel 
        loadingProjects={loadingProjects}
        projectMarkersCount={projectMarkers.length}
        totalProjectsCount={projects.length}
      />
    </div>
  );
};